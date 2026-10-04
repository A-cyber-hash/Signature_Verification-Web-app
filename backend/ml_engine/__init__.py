"""
SignaSecure ML Engine
─────────────────────
Production signature verification ML pipeline.

Usage:
    from ml_engine import verify_signatures, get_engine

    result = verify_signatures(template_file, query_file)
    # result keys: is_verified, match_score, status, breakdown, confidence_level, ...
"""
from .engine import get_engine, SignatureEngine

__all__ = ["get_engine", "SignatureEngine", "verify_signatures"]


def verify_signatures(template_source, query_source) -> dict:
    """Convenience wrapper — verify two signature images."""
    return get_engine().verify(template_source, query_source)
