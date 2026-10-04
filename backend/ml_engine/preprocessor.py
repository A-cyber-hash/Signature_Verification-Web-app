"""
ml_engine/preprocessor.py
─────────────────────────
Full production-grade signature image preprocessor.

Pipeline:
  raw image → grayscale → denoise → binarize (Otsu/adaptive)
            → morphological clean → thin (skeletonize) → pad/crop → normalize
Output: uint8 numpy array (128×128), single channel, ink=255 background=0
"""
import io
import base64
import logging
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)

TARGET_SIZE = (128, 128)


# ─────────────────────────────────────────────────────────────────────────────
# Input loading
# ─────────────────────────────────────────────────────────────────────────────

def load_image(source) -> np.ndarray:
    """
    Accept:  Django InMemoryUploadedFile | bytes | base64 data-URL | file path
    Returns: BGR uint8 numpy array
    """
    if isinstance(source, str):
        if source.startswith("data:"):
            _, b64 = source.split(",", 1)
            source = base64.b64decode(b64)
        else:
            return cv2.imread(source)

    if isinstance(source, (bytes, bytearray)):
        arr = np.frombuffer(source, np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)

    # Django file object
    source.seek(0)
    raw = source.read()
    arr = np.frombuffer(raw, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        # fallback via Pillow (handles more formats)
        source.seek(0)
        pil = Image.open(source).convert("RGB")
        img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return img


# ─────────────────────────────────────────────────────────────────────────────
# Pre-processing stages
# ─────────────────────────────────────────────────────────────────────────────

def to_gray(img: np.ndarray) -> np.ndarray:
    if len(img.shape) == 3:
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img


def denoise(gray: np.ndarray) -> np.ndarray:
    """Non-local means denoising — preserves stroke edges."""
    return cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)


def binarize(gray: np.ndarray) -> np.ndarray:
    """
    Robust binarization:
    1. Try Otsu on denoised image.
    2. If ink-pixel ratio is unhealthy, fall back to adaptive Gaussian.
    Returns binary image: ink=255, background=0
    """
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    ink_ratio = np.sum(otsu == 255) / otsu.size
    if 0.02 < ink_ratio < 0.60:
        return otsu

    # Adaptive fallback
    adaptive = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, 21, 8
    )
    return adaptive


def morphological_clean(binary: np.ndarray) -> np.ndarray:
    """Remove small noise blobs, close small gaps in strokes."""
    # Remove tiny specks
    kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_open, iterations=1)

    # Close small stroke gaps
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel_close, iterations=1)
    return closed


def remove_large_blobs(binary: np.ndarray, max_area_ratio: float = 0.30) -> np.ndarray:
    """Drop connected components that are suspiciously large (likely page artifacts)."""
    n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary)
    total_area = binary.size
    out = np.zeros_like(binary)
    for i in range(1, n_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area < total_area * max_area_ratio:
            out[labels == i] = 255
    return out


def crop_to_content(binary: np.ndarray, padding: int = 8) -> np.ndarray:
    """Tight crop around ink bounding box with padding."""
    ys, xs = np.where(binary == 255)
    if len(ys) == 0:
        return binary
    y1, y2 = max(ys.min() - padding, 0), min(ys.max() + padding, binary.shape[0])
    x1, x2 = max(xs.min() - padding, 0), min(xs.max() + padding, binary.shape[1])
    return binary[y1:y2, x1:x2]


def resize_with_aspect(binary: np.ndarray, target=(128, 128)) -> np.ndarray:
    """Resize preserving aspect ratio, pad with zeros."""
    h, w = binary.shape
    th, tw = target
    scale = min(tw / w, th / h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = cv2.resize(binary, (new_w, new_h), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((th, tw), dtype=np.uint8)
    y_off = (th - new_h) // 2
    x_off = (tw - new_w) // 2
    canvas[y_off:y_off + new_h, x_off:x_off + new_w] = resized
    return canvas


def thin_strokes(binary: np.ndarray) -> np.ndarray:
    """
    Zhang-Suen thinning via iterative erosion (OpenCV thinning).
    Produces 1-pixel-wide skeleton — critical for stroke analysis.
    """
    try:
        from skimage.morphology import skeletonize
        sk = skeletonize(binary // 255).astype(np.uint8) * 255
        return sk
    except ImportError:
        # fallback: simple erosion-based approximation
        kernel = np.ones((2, 2), np.uint8)
        return cv2.erode(binary, kernel, iterations=1)


# ─────────────────────────────────────────────────────────────────────────────
# Master pipeline
# ─────────────────────────────────────────────────────────────────────────────

def preprocess(source, produce_skeleton: bool = True) -> dict:
    """
    Full pipeline.  Returns:
        {
          'binary':    uint8 (128×128) — cleaned binarized image
          'skeleton':  uint8 (128×128) — thinned strokes
          'normalized': float32 (128×128) — 0..1 normalized binary
        }
    """
    raw = load_image(source)
    if raw is None:
        raise ValueError("Could not decode image from source.")

    gray = to_gray(raw)
    denoised = denoise(gray)
    binary = binarize(denoised)
    binary = morphological_clean(binary)
    binary = remove_large_blobs(binary)
    binary = crop_to_content(binary, padding=10)
    binary = resize_with_aspect(binary, TARGET_SIZE)

    skeleton = thin_strokes(binary) if produce_skeleton else binary.copy()

    normalized = binary.astype(np.float32) / 255.0

    return {
        "binary": binary,
        "skeleton": skeleton,
        "normalized": normalized,
        "raw_gray": gray,
    }
