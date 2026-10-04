"""
ml_engine/similarity.py
───────────────────────
6 independent similarity metrics for two signature feature vectors / images.

Metrics:
  1. Cosine similarity        — direction of feature vectors
  2. Euclidean distance       — inverted to similarity
  3. Structural Similarity    — pixel-level SSIM on processed images
  4. ORB match ratio          — keypoint descriptor matching
  5. Histogram intersection   — LBP histogram overlap
  6. Stroke geometry distance — direct geometric feature comparison

All metrics are mapped to [0, 1] where 1 = identical.
"""
import logging
import numpy as np
import cv2
from scipy.spatial.distance import cosine, euclidean

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Metric 1: Cosine Similarity
# ─────────────────────────────────────────────────────────────────────────────

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    try:
        dist = cosine(v1.astype(np.float64), v2.astype(np.float64))
        return float(np.clip(1.0 - dist, 0.0, 1.0))
    except Exception:
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Metric 2: Euclidean Distance → Similarity
# ─────────────────────────────────────────────────────────────────────────────

def euclidean_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """Map euclidean distance to [0,1] via Gaussian kernel."""
    try:
        dist = euclidean(v1.astype(np.float64), v2.astype(np.float64))
        # sigma chosen empirically for L2-normalized 654-dim vectors
        sigma = 0.5
        sim = float(np.exp(-(dist ** 2) / (2 * sigma ** 2)))
        return float(np.clip(sim, 0.0, 1.0))
    except Exception:
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Metric 3: Structural Similarity Index (SSIM)
# ─────────────────────────────────────────────────────────────────────────────

def ssim_similarity(img1: np.ndarray, img2: np.ndarray) -> float:
    """
    Full SSIM on 128×128 binary images.
    Pure numpy — no scikit-image required.
    """
    try:
        i1 = img1.astype(np.float64) / 255.0
        i2 = img2.astype(np.float64) / 255.0

        C1, C2 = (0.01 * 1) ** 2, (0.03 * 1) ** 2
        kernel_size = 11
        sigma = 1.5
        kh = cv2.getGaussianKernel(kernel_size, sigma)
        kernel = kh @ kh.T

        mu1 = cv2.filter2D(i1, -1, kernel)
        mu2 = cv2.filter2D(i2, -1, kernel)
        mu1_sq, mu2_sq, mu12 = mu1 ** 2, mu2 ** 2, mu1 * mu2

        sigma1_sq = cv2.filter2D(i1 ** 2, -1, kernel) - mu1_sq
        sigma2_sq = cv2.filter2D(i2 ** 2, -1, kernel) - mu2_sq
        sigma12 = cv2.filter2D(i1 * i2, -1, kernel) - mu12

        num = (2 * mu12 + C1) * (2 * sigma12 + C2)
        den = (mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2)
        ssim_map = num / (den + 1e-10)

        return float(np.clip(ssim_map.mean(), 0.0, 1.0))
    except Exception as e:
        logger.warning(f"SSIM failed: {e}")
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Metric 4: ORB Feature Match Ratio
# ─────────────────────────────────────────────────────────────────────────────

def orb_match_similarity(img1: np.ndarray, img2: np.ndarray, n_features: int = 500) -> float:
    """
    ORB + Brute-Force matching with Lowe's ratio test.
    Returns ratio of good matches to total keypoints.
    """
    try:
        orb = cv2.ORB_create(nfeatures=n_features)
        kp1, des1 = orb.detectAndCompute(img1, None)
        kp2, des2 = orb.detectAndCompute(img2, None)

        if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
            return 0.0

        bf = cv2.BFMatcher(cv2.NORM_HAMMING)
        matches = bf.knnMatch(des1, des2, k=2)

        # Lowe's ratio test
        good = []
        for pair in matches:
            if len(pair) == 2:
                m, n = pair
                if m.distance < 0.75 * n.distance:
                    good.append(m)

        if not good:
            return 0.0

        # Geometric consistency via homography RANSAC
        if len(good) >= 4:
            src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            _, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            inlier_count = int(mask.sum()) if mask is not None else 0
            score = inlier_count / max(len(kp1), len(kp2))
        else:
            score = len(good) / max(len(kp1), len(kp2))

        return float(np.clip(score * 3.0, 0.0, 1.0))  # scale factor for sparse matches
    except Exception as e:
        logger.warning(f"ORB match failed: {e}")
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Metric 5: LBP Histogram Intersection
# ─────────────────────────────────────────────────────────────────────────────

def histogram_intersection_similarity(v1: np.ndarray, v2: np.ndarray,
                                       lbp_dims: int = 256) -> float:
    """
    LBP histogram intersection.
    HOG(7056) + LBP(256) in the full vector.  After L2 normalisation the
    histogram segment no longer sums to 1, but relative comparison still works.
    """
    try:
        hog_dim = 8100   # actual HOGDescriptor output for 128x128
        h1 = np.abs(v1[hog_dim: hog_dim + lbp_dims])
        h2 = np.abs(v2[hog_dim: hog_dim + lbp_dims])
        denom = max(h1.sum() + h2.sum(), 1e-10)
        intersection = np.minimum(h1, h2).sum()
        # Dice-style: 2*intersection / (sum1+sum2)
        score = 2.0 * intersection / denom
        return float(np.clip(score, 0.0, 1.0))
    except Exception as e:
        logger.warning(f"Histogram intersection failed: {e}")
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Metric 6: Stroke Geometry Distance
# ─────────────────────────────────────────────────────────────────────────────

def stroke_geometry_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """
    Compares stroke-geometry features (12-dim).
    Locates them by scanning for the non-histogram segment after LBP.
    """
    try:
        # HOG(7056) + LBP(256) + Hu(7) + Zernike(25) = 7344  → stroke at 7344
        # But actual HOG size depends on descriptor config, compute safely:
        # We know total vector dim ~8428, stroke is 12 dims.
        # Use last known stable offsets based on feature_extractor order.
        # Offset = hog + lbp + hu + zernike
        hog_dim     = 8100  # actual HOGDescriptor output for 128x128
        lbp_dim     = 256
        hu_dim      = 7
        zernike_dim = 25
        offset = hog_dim + lbp_dim + hu_dim + zernike_dim   # = 8388
        s1 = v1[offset: offset + 12]
        s2 = v2[offset: offset + 12]
        dist = np.linalg.norm(s1 - s2)
        sim = 1.0 - float(np.clip(dist / np.sqrt(12), 0.0, 1.0))
        return sim
    except Exception:
        return 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Ensemble scorer
# ─────────────────────────────────────────────────────────────────────────────

# Empirically tuned weights (sum = 1.0)
_METRIC_WEIGHTS = {
    "cosine":      0.30,
    "euclidean":   0.20,
    "ssim":        0.20,
    "orb":         0.15,
    "histogram":   0.08,
    "stroke":      0.07,
}


def compute_all_scores(feat1: np.ndarray, feat2: np.ndarray,
                        img1: np.ndarray, img2: np.ndarray) -> dict:
    """
    Compute all 6 similarity metrics.
    Returns dict with individual scores and weighted ensemble.
    """
    scores = {
        "cosine":    cosine_similarity(feat1, feat2),
        "euclidean": euclidean_similarity(feat1, feat2),
        "ssim":      ssim_similarity(img1, img2),
        "orb":       orb_match_similarity(img1, img2),
        "histogram": histogram_intersection_similarity(feat1, feat2),
        "stroke":    stroke_geometry_similarity(feat1, feat2),
    }

    ensemble = sum(_METRIC_WEIGHTS[k] * scores[k] for k in _METRIC_WEIGHTS)
    scores["ensemble_raw"] = float(np.clip(ensemble, 0.0, 1.0))

    return scores
