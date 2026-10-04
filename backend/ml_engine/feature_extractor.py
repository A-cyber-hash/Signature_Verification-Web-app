"""
ml_engine/feature_extractor.py
───────────────────────────────
7-group feature extraction pipeline for signature images.

Groups:
  1. HOG  (Histogram of Oriented Gradients)       — 324-dim
  2. LBP  (Local Binary Pattern histogram)         — 256-dim
  3. Hu Moments (7 invariant moments)              —   7-dim
  4. Zernike-like radial moments                   —  25-dim
  5. Stroke geometry (from skeleton)               —  12-dim
  6. SIFT keypoint statistics                      —  16-dim
  7. Contour / shape descriptors                   —  14-dim
                                          TOTAL    ~ 654-dim (L2-normalized)
"""
import logging
import math
import numpy as np
import cv2
from scipy.ndimage import label as scipy_label

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1. HOG Features
# ─────────────────────────────────────────────────────────────────────────────

def hog_features(binary: np.ndarray) -> np.ndarray:
    """
    HOG on 128×128 image.
    9 orientations, 8×8 cells, 2×2 blocks → captures local gradient patterns.
    """
    hog = cv2.HOGDescriptor(
        _winSize=(128, 128),
        _blockSize=(16, 16),
        _blockStride=(8, 8),
        _cellSize=(8, 8),
        _nbins=9
    )
    feat = hog.compute(binary).flatten()
    return feat.astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
# 2. LBP Features
# ─────────────────────────────────────────────────────────────────────────────

def lbp_features(binary: np.ndarray, radius: int = 2, n_points: int = 16) -> np.ndarray:
    """
    Uniform LBP histogram — captures micro-texture of ink strokes.
    Pure-numpy implementation (avoids scikit-image dependency for speed).
    """
    h, w = binary.shape
    lbp = np.zeros((h, w), dtype=np.uint8)

    # Sample angles
    angles = [2 * np.pi * i / n_points for i in range(n_points)]
    neighbors = [(int(round(radius * np.sin(a))), int(round(radius * np.cos(a)))) for a in angles]

    center = binary[radius:-radius, radius:-radius].astype(np.float32)
    code = np.zeros_like(center, dtype=np.uint32)

    for i, (dy, dx) in enumerate(neighbors):
        sy, sx = radius + dy, radius + dx
        ey = sy + center.shape[0]
        ex = sx + center.shape[1]
        nb = binary[sy:ey, sx:ex].astype(np.float32)
        code |= ((nb >= center).astype(np.uint32) << i)

    hist, _ = np.histogram(code.flatten(), bins=256, range=(0, 256))
    hist = hist.astype(np.float32)
    total = hist.sum()
    if total > 0:
        hist /= total
    return hist


# ─────────────────────────────────────────────────────────────────────────────
# 3. Hu Moments (rotation / scale / translation invariant)
# ─────────────────────────────────────────────────────────────────────────────

def hu_moments_features(binary: np.ndarray) -> np.ndarray:
    moments = cv2.moments(binary)
    hu = cv2.HuMoments(moments).flatten()
    # Log-transform for scale normalization
    hu = -np.sign(hu) * np.log10(np.abs(hu) + 1e-10)
    return hu.astype(np.float32)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Zernike-like Radial Moments
# ─────────────────────────────────────────────────────────────────────────────

def zernike_features(binary: np.ndarray, max_order: int = 4) -> np.ndarray:
    """
    Approximate Zernike moment magnitudes up to order `max_order`.
    25 features for max_order=4.  Invariant to rotation.
    """
    h, w = binary.shape
    cx, cy = w / 2.0, h / 2.0
    R = min(w, h) / 2.0

    xs = (np.arange(w) - cx) / R
    ys = (np.arange(h) - cy) / R
    X, Y = np.meshgrid(xs, ys)
    rho = np.sqrt(X ** 2 + Y ** 2)
    theta = np.arctan2(Y, X)

    mask = rho <= 1.0
    f = binary.astype(np.float64)
    features = []

    for n in range(max_order + 1):
        for m in range(-n, n + 1, 2):
            if (n - abs(m)) % 2 != 0:
                continue
            # Radial polynomial R_nm
            R_nm = np.zeros_like(rho)
            for s in range((n - abs(m)) // 2 + 1):
                coeff = ((-1) ** s * math.factorial(n - s)) / (
                    math.factorial(s) *
                    math.factorial((n + abs(m)) // 2 - s) *
                    math.factorial((n - abs(m)) // 2 - s)
                )
                R_nm += coeff * (rho ** (n - 2 * s))

            V = R_nm * np.exp(1j * m * theta)
            Z = np.sum(f * np.conj(V) * mask)
            features.append(abs(Z))

    feat = np.array(features[:25], dtype=np.float32)
    return feat


# ─────────────────────────────────────────────────────────────────────────────
# 5. Stroke Geometry (from skeleton)
# ─────────────────────────────────────────────────────────────────────────────

def stroke_features(skeleton: np.ndarray) -> np.ndarray:
    """
    12 geometric stroke statistics computed from the thinned skeleton:
    - stroke pixel count, density
    - number of connected components (stroke segments)
    - average / std stroke length
    - horizontal / vertical coverage ratio
    - centroid x/y normalized
    - bounding box aspect ratio
    - convex hull / contour area ratio
    - junction count (pixels with 3+ neighbors)
    - endpoint count (pixels with exactly 1 neighbor)
    """
    h, w = skeleton.shape
    total_pixels = h * w

    ink_pixels = int(np.sum(skeleton > 0))
    density = ink_pixels / total_pixels

    # Connected components
    binary_bool = (skeleton > 0).astype(np.uint8)
    n_components, labels = cv2.connectedComponents(binary_bool)
    n_strokes = max(n_components - 1, 0)

    # Component lengths
    lengths = []
    for i in range(1, n_components):
        lengths.append(int(np.sum(labels == i)))
    avg_len = np.mean(lengths) / total_pixels if lengths else 0.0
    std_len = np.std(lengths) / total_pixels if len(lengths) > 1 else 0.0

    # Coverage ratios
    ys, xs = np.where(skeleton > 0)
    if len(ys) == 0:
        return np.zeros(12, dtype=np.float32)

    h_cover = (ys.max() - ys.min() + 1) / h
    v_cover = (xs.max() - xs.min() + 1) / w
    cx_norm = xs.mean() / w
    cy_norm = ys.mean() / h
    bb_aspect = ((xs.max() - xs.min() + 1) / max(ys.max() - ys.min() + 1, 1))

    # Convex hull ratio
    points = np.column_stack([xs, ys]).astype(np.float32)
    hull = cv2.convexHull(points)
    hull_area = max(cv2.contourArea(hull), 1)
    contour_area = max(ink_pixels, 1)
    hull_ratio = contour_area / hull_area

    # Junction / endpoint count using 3x3 neighbor sum on skeleton
    skel_norm = (skeleton > 0).astype(np.uint8)
    kernel = np.ones((3, 3), np.uint8)
    neighbor_count = cv2.filter2D(skel_norm.astype(np.float32), -1, kernel.astype(np.float32)) - skel_norm
    junction_mask = (skel_norm == 1) & (neighbor_count >= 3)
    endpoint_mask = (skel_norm == 1) & (neighbor_count == 1)
    junction_count = float(np.sum(junction_mask)) / max(ink_pixels, 1)
    endpoint_count = float(np.sum(endpoint_mask)) / max(ink_pixels, 1)

    return np.array([
        density, n_strokes / 50.0, avg_len, std_len,
        h_cover, v_cover, cx_norm, cy_norm,
        bb_aspect / 5.0, hull_ratio,
        junction_count, endpoint_count
    ], dtype=np.float32)


# ─────────────────────────────────────────────────────────────────────────────
# 6. SIFT Keypoint Statistics
# ─────────────────────────────────────────────────────────────────────────────

def sift_features(binary: np.ndarray) -> np.ndarray:
    """
    16-dim SIFT statistics: keypoint count, mean/std of (x, y, size, response, angle).
    No descriptor matching needed — statistics alone capture signature complexity.
    """
    sift = cv2.SIFT_create(nfeatures=200)
    keypoints = sift.detect(binary, None)

    if len(keypoints) == 0:
        return np.zeros(16, dtype=np.float32)

    h, w = binary.shape
    xs = np.array([kp.pt[0] / w for kp in keypoints])
    ys = np.array([kp.pt[1] / h for kp in keypoints])
    sizes = np.array([kp.size / max(w, h) for kp in keypoints])
    responses = np.array([kp.response for kp in keypoints])
    angles = np.array([kp.angle / 360.0 for kp in keypoints])

    count_norm = min(len(keypoints) / 200.0, 1.0)

    feat = np.array([
        count_norm,
        xs.mean(), xs.std(),
        ys.mean(), ys.std(),
        sizes.mean(), sizes.std(),
        responses.mean() / (responses.max() + 1e-6), responses.std() / (responses.max() + 1e-6),
        angles.mean(), angles.std(),
        # Spatial distribution: quadrant density
        np.mean(xs < 0.5), np.mean(xs >= 0.5),
        np.mean(ys < 0.5), np.mean(ys >= 0.5),
        np.std([xs.mean(), ys.mean(), sizes.mean()]),
    ], dtype=np.float32)

    return feat


# ─────────────────────────────────────────────────────────────────────────────
# 7. Contour / Shape Descriptors
# ─────────────────────────────────────────────────────────────────────────────

def contour_features(binary: np.ndarray) -> np.ndarray:
    """
    14-dim shape descriptor from all contours:
    solidity, extent, equivalent diameter, eccentricity,
    perimeter/area, convexity defects count, circularity,
    and Fourier descriptor energy (5 bins).
    """
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return np.zeros(14, dtype=np.float32)

    # Use largest contour
    c = max(contours, key=cv2.contourArea)
    area = max(cv2.contourArea(c), 1)
    perimeter = max(cv2.arcLength(c, True), 1)
    hull = cv2.convexHull(c)
    hull_area = max(cv2.contourArea(hull), 1)

    rect = cv2.minAreaRect(c)
    rect_area = max(rect[1][0] * rect[1][1], 1)

    solidity = area / hull_area
    extent = area / rect_area
    circularity = (4 * np.pi * area) / (perimeter ** 2)
    perim_area = perimeter / area

    # Ellipse fit
    if len(c) >= 5:
        ellipse = cv2.fitEllipse(c)
        minor, major = sorted(ellipse[1])
        eccentricity = np.sqrt(1 - (minor / max(major, 1)) ** 2) if major > 0 else 0.0
        equiv_diam = np.sqrt(4 * area / np.pi) / 128.0
    else:
        eccentricity = 0.0
        equiv_diam = 0.0

    # Convex hull defects
    try:
        hull_idx = cv2.convexHull(c, returnPoints=False)
        defects = cv2.convexityDefects(c, hull_idx)
        defect_count = len(defects) / 50.0 if defects is not None else 0.0
    except Exception:
        defect_count = 0.0

    # Fourier descriptor energy (5 low-frequency bins)
    c_complex = c[:, 0, 0] + 1j * c[:, 0, 1]
    fd = np.fft.fft(c_complex)
    fd_mag = np.abs(fd)
    total_energy = max(fd_mag.sum(), 1)
    fd_bins = np.array([fd_mag[1:3].sum(), fd_mag[3:6].sum(), fd_mag[6:10].sum(),
                        fd_mag[10:15].sum(), fd_mag[15:21].sum()]) / total_energy

    return np.array([
        solidity, extent, equiv_diam, eccentricity,
        perim_area / 10.0, circularity, defect_count,
        *fd_bins
    ], dtype=np.float32)


# ─────────────────────────────────────────────────────────────────────────────
# Master extractor
# ─────────────────────────────────────────────────────────────────────────────

def extract_features(preprocessed: dict) -> np.ndarray:
    """
    Run all 7 feature groups and return a single L2-normalized vector.
    Input: dict from preprocessor.preprocess()
    """
    binary = preprocessed["binary"]
    skeleton = preprocessed["skeleton"]

    groups = []

    try:
        groups.append(hog_features(binary))
    except Exception as e:
        logger.warning(f"HOG failed: {e}")
        groups.append(np.zeros(324, dtype=np.float32))

    try:
        groups.append(lbp_features(binary))
    except Exception as e:
        logger.warning(f"LBP failed: {e}")
        groups.append(np.zeros(256, dtype=np.float32))

    try:
        groups.append(hu_moments_features(binary))
    except Exception as e:
        logger.warning(f"Hu moments failed: {e}")
        groups.append(np.zeros(7, dtype=np.float32))

    try:
        groups.append(zernike_features(binary))
    except Exception as e:
        logger.warning(f"Zernike failed: {e}")
        groups.append(np.zeros(25, dtype=np.float32))

    try:
        groups.append(stroke_features(skeleton))
    except Exception as e:
        logger.warning(f"Stroke features failed: {e}")
        groups.append(np.zeros(12, dtype=np.float32))

    try:
        groups.append(sift_features(binary))
    except Exception as e:
        logger.warning(f"SIFT failed: {e}")
        groups.append(np.zeros(16, dtype=np.float32))

    try:
        groups.append(contour_features(binary))
    except Exception as e:
        logger.warning(f"Contour failed: {e}")
        groups.append(np.zeros(14, dtype=np.float32))

    vector = np.concatenate(groups)

    # L2 normalize
    norm = np.linalg.norm(vector)
    if norm > 1e-8:
        vector = vector / norm

    return vector.astype(np.float32)
