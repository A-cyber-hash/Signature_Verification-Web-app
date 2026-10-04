"""
ml_engine/calibrator.py
───────────────────────
Post-processing pipeline for raw similarity scores:

1. Sigmoid calibration — maps raw [0,1] ensemble to calibrated probability
2. Multi-metric confidence interval
3. Fraud signal detection — flags suspicious patterns
4. Final decision with explanation
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

MATCH_THRESHOLD = 0.85   # 85% — final calibrated score must meet this
FRAUD_THRESHOLD  = 0.40  # scores this low with high confidence = likely forgery


# ─────────────────────────────────────────────────────────────────────────────
# Sigmoid calibration
# ─────────────────────────────────────────────────────────────────────────────

def sigmoid_calibrate(raw_score: float,
                       steepness: float = 10.0,
                       midpoint: float = 0.50) -> float:
    """
    Map raw ensemble score through a sigmoid to produce a calibrated
    probability that better separates genuine vs. forged signatures.

    sigmoid(x) = 1 / (1 + exp(-k*(x - m)))
    k=10, m=0.50 → steep curve centred at 0.50
    """
    val = 1.0 / (1.0 + np.exp(-steepness * (raw_score - midpoint)))
    return float(np.clip(val, 0.0, 1.0))


# ─────────────────────────────────────────────────────────────────────────────
# Confidence interval from metric agreement
# ─────────────────────────────────────────────────────────────────────────────

def compute_confidence(scores: dict) -> dict:
    """
    Measure how much the 6 metrics agree with each other.
    High agreement → high confidence in the final score.

    Returns:
        confidence_level: float [0,1]
        confidence_label: str ('low'|'medium'|'high'|'very_high')
        metric_variance:  float
    """
    metric_scores = [
        scores["cosine"], scores["euclidean"], scores["ssim"],
        scores["orb"], scores["histogram"], scores["stroke"]
    ]
    arr = np.array(metric_scores, dtype=np.float64)
    variance = float(np.var(arr))
    std_dev  = float(np.std(arr))

    # Low variance = metrics agree = high confidence
    confidence_level = float(np.clip(1.0 - (std_dev / 0.4), 0.0, 1.0))

    if confidence_level >= 0.85:
        label = "very_high"
    elif confidence_level >= 0.65:
        label = "high"
    elif confidence_level >= 0.40:
        label = "medium"
    else:
        label = "low"

    return {
        "confidence_level": round(confidence_level, 4),
        "confidence_label": label,
        "metric_variance":  round(variance, 6),
        "metric_std_dev":   round(std_dev, 6),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Fraud signal detection
# ─────────────────────────────────────────────────────────────────────────────

def detect_fraud_signals(scores: dict, calibrated: float) -> dict:
    """
    Look for patterns typical of forgery attempts:

    - Tracing forgery: SSIM high but stroke geometry very different
      (traced image looks similar but stroke structure differs)
    - Copy-paste: ORB extremely high but SSIM moderate
    - Random noise: all metrics very low
    - Partial match: some metrics high, others low
    """
    signals = []
    fraud_probability = 0.0

    ssim   = scores.get("ssim", 0)
    stroke = scores.get("stroke", 0)
    orb    = scores.get("orb", 0)
    cosine = scores.get("cosine", 0)
    hist   = scores.get("histogram", 0)

    # Tracing forgery signal
    if ssim > 0.70 and stroke < 0.40:
        signals.append("possible_tracing")
        fraud_probability += 0.35

    # Copy-paste signal
    if orb > 0.80 and ssim < 0.50:
        signals.append("possible_digital_copy")
        fraud_probability += 0.25

    # Structural mismatch (partial forgery)
    if cosine > 0.70 and stroke < 0.35:
        signals.append("structural_mismatch")
        fraud_probability += 0.20

    # All-low = noise or unrelated signature
    all_low = all([ssim < 0.30, orb < 0.20, cosine < 0.40, hist < 0.30])
    if all_low:
        signals.append("unrelated_signature")
        fraud_probability += 0.10

    fraud_probability = float(np.clip(fraud_probability, 0.0, 1.0))

    return {
        "fraud_signals":      signals,
        "fraud_probability":  round(fraud_probability, 4),
        "fraud_flag":         fraud_probability > 0.50,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Final decision engine
# ─────────────────────────────────────────────────────────────────────────────

def make_decision(scores: dict) -> dict:
    """
    Full decision pipeline:
    1. Calibrate raw ensemble score
    2. Compute confidence
    3. Detect fraud signals
    4. Apply threshold and return structured result

    Returns complete verification result dict.
    """
    raw    = scores["ensemble_raw"]
    calibrated = sigmoid_calibrate(raw)

    # Confidence-adjusted final score
    confidence_info = compute_confidence(scores)
    conf_level      = confidence_info["confidence_level"]

    # Confidence acts as a slight multiplier (±5% max adjustment)
    confidence_adjustment = (conf_level - 0.5) * 0.10
    final_score = float(np.clip(calibrated + confidence_adjustment, 0.0, 1.0))

    # Fraud detection
    fraud_info = detect_fraud_signals(scores, calibrated)

    # Decision
    is_verified = (final_score >= MATCH_THRESHOLD) and (not fraud_info["fraud_flag"])

    # Human-readable breakdown
    breakdown = {
        "cosine_similarity":       round(scores["cosine"] * 100, 2),
        "euclidean_similarity":    round(scores["euclidean"] * 100, 2),
        "structural_similarity":   round(scores["ssim"] * 100, 2),
        "keypoint_match":          round(scores["orb"] * 100, 2),
        "texture_similarity":      round(scores["histogram"] * 100, 2),
        "stroke_geometry_match":   round(scores["stroke"] * 100, 2),
    }

    dominant_metric = max(breakdown, key=lambda k: breakdown[k])
    weakest_metric  = min(breakdown, key=lambda k: breakdown[k])

    explanation = _build_explanation(is_verified, final_score, breakdown,
                                      fraud_info, confidence_info)

    return {
        # Core result
        "is_verified":          is_verified,
        "status":               "VERIFIED" if is_verified else "NOT_VERIFIED",
        "match_score":          round(final_score * 100, 2),
        "match_score_raw":      round(final_score, 4),
        "threshold":            MATCH_THRESHOLD * 100,

        # Detailed scores
        "raw_ensemble_score":   round(raw * 100, 2),
        "calibrated_score":     round(calibrated * 100, 2),
        "breakdown":            breakdown,

        # Confidence
        **confidence_info,

        # Fraud
        **fraud_info,

        # Insight
        "dominant_metric":      dominant_metric,
        "weakest_metric":       weakest_metric,
        "explanation":          explanation,
        "message": (
            f"✅ Signature VERIFIED — Match: {round(final_score*100,2)}%"
            if is_verified
            else f"❌ Signature NOT verified — Match: {round(final_score*100,2)}% (Need ≥85%)"
        ),
    }


def _build_explanation(is_verified, score, breakdown, fraud, confidence):
    parts = []
    if is_verified:
        parts.append(f"Signature matches with {round(score*100,2)}% confidence.")
    else:
        parts.append(f"Signature does not meet the 85% threshold ({round(score*100,2)}% achieved).")

    if fraud["fraud_signals"]:
        parts.append(f"Fraud signals detected: {', '.join(fraud['fraud_signals'])}.")

    low_metrics = [k for k, v in breakdown.items() if v < 50]
    if low_metrics:
        parts.append(f"Low scores in: {', '.join(low_metrics)}.")

    parts.append(f"Confidence: {confidence['confidence_label']} ({round(confidence['confidence_level']*100,1)}%).")
    return " ".join(parts)
