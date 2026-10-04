"""
ml_engine/engine.py
───────────────────
Top-level SignaSecure ML engine.

Public API:
    engine = SignatureEngine()
    result = engine.verify(template_source, query_source)

Pipeline:
    preprocess → extract_features → compute_similarity → calibrate → decision
"""
import io
import logging
import pickle
import hashlib
import numpy as np

from .preprocessor import preprocess
from .feature_extractor import extract_features
from .similarity import compute_all_scores
from .calibrator import make_decision

logger = logging.getLogger(__name__)

# In-memory feature cache {sha256: (features, processed)}
_FEATURE_CACHE: dict = {}
_CACHE_MAX = 512


def _cache_key(source) -> str:
    """Generate SHA-256 cache key from image source bytes."""
    if hasattr(source, "read"):
        source.seek(0)
        data = source.read()
        source.seek(0)
    elif isinstance(source, str) and source.startswith("data:"):
        data = source.encode()
    elif isinstance(source, (bytes, bytearray)):
        data = source
    else:
        data = str(source).encode()
    return hashlib.sha256(data).hexdigest()


def _get_cached(source):
    key = _cache_key(source)
    return _FEATURE_CACHE.get(key), key


def _set_cached(key: str, value):
    if len(_FEATURE_CACHE) >= _CACHE_MAX:
        # Evict oldest entry
        oldest = next(iter(_FEATURE_CACHE))
        del _FEATURE_CACHE[oldest]
    _FEATURE_CACHE[key] = value


class SignatureEngine:
    """
    Stateless ML engine for signature verification.
    Thread-safe: all state is in the in-process cache.
    """

    def process_image(self, source) -> tuple:
        """
        Preprocess + extract features for one image.
        Returns (features: np.ndarray, processed: dict)
        Uses in-memory cache to avoid reprocessing templates.
        """
        cached, key = _get_cached(source)
        if cached is not None:
            return cached

        processed = preprocess(source, produce_skeleton=True)
        features = extract_features(processed)
        value = (features, processed)
        _set_cached(key, value)
        return value

    def verify(self, template_source, query_source) -> dict:
        """
        Full verification pipeline.

        Args:
            template_source: enrolled signature (file/bytes/base64)
            query_source:    captured/uploaded signature to verify

        Returns:
            Complete result dict from calibrator.make_decision()
        """
        try:
            feat_t, proc_t = self.process_image(template_source)
            feat_q, proc_q = self.process_image(query_source)
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            raise ValueError(f"Cannot process image: {e}")

        scores = compute_all_scores(
            feat_t, feat_q,
            proc_t["binary"], proc_q["binary"]
        )

        result = make_decision(scores)
        return result

    def extract_and_serialize(self, source) -> bytes:
        """Extract features and return as pickle bytes for DB storage."""
        feat, _ = self.process_image(source)
        return pickle.dumps(feat)

    def deserialize_features(self, blob: bytes) -> np.ndarray:
        return pickle.loads(blob)


# Module-level singleton
_engine_instance: SignatureEngine = None


def get_engine() -> SignatureEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = SignatureEngine()
        logger.info("SignatureEngine initialized.")
    return _engine_instance
