/**
 * AI Analysis Service - Claude API Integration
 * Provides intelligent insights for signature comparison reports
 */

import api from './api';

/**
 * Generate intelligent analysis using Claude AI
 * @param {Object} comparisonData - Signature comparison results
 * @returns {Promise<Object>} - AI-generated analysis
 */
export const generateAIAnalysis = async (comparisonData) => {
  try {
    const prompt = buildAnalysisPrompt(comparisonData);

    const response = await api.post('/analytics/ai-analysis/', { prompt });
    const analysisText = response.data.text;

    return parseAIAnalysis(analysisText, comparisonData);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return generateFallbackAnalysis(comparisonData);
  }
};

/**
 * Build prompt for Claude API
 */
const buildAnalysisPrompt = (data) => {
  return `You are an expert in biometric signature analysis and forensic document examination. 
Analyze the following signature comparison results and provide a professional assessment.

COMPARISON DATA:
- Match Score: ${data.match_score}%
- Status: ${data.status}
- Is Match: ${data.is_match}
- Threshold: ${data.threshold}%
- Confidence: ${data.confidence_label}
- Fraud Probability: ${data.fraud_probability}%
- Fraud Signals: ${JSON.stringify(data.fraud_signals || [])}

METRIC BREAKDOWN:
${Object.entries(data.breakdown || {})
  .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}%`)
  .join('\n')}

DOMINANT METRIC: ${data.dominant_metric || 'N/A'}
WEAKEST METRIC: ${data.weakest_metric || 'N/A'}

Please provide:
1. Summary: A brief professional assessment (2-3 sentences)
2. Key Findings: 3-5 bullet points about the comparison
3. Risk Assessment: Fraud risk evaluation
4. Recommendations: Next steps or additional verification if needed
5. Technical Notes: Explanation of the metrics and why they matter

Format your response as JSON with these exact keys: summary, keyFindings, riskAssessment, recommendations, technicalNotes`;
};

/**
 * Parse AI analysis response
 */
const parseAIAnalysis = (text, data) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        ...parsed,
        rawResponse: text,
      };
    }
    return generateFallbackAnalysis(data);
  } catch (error) {
    console.error('Parse Error:', error);
    return generateFallbackAnalysis(data);
  }
};

/**
 * Generate fallback analysis when AI is unavailable
 */
const generateFallbackAnalysis = (data) => {
  const confidence = data.confidence_label || 'Medium';
  const isFraud = data.fraud_flag ? 'High' : 'Low';

  return {
    success: false,
    summary: `Signature comparison shows ${data.match_score}% accuracy with ${confidence} confidence. The signatures ${
      data.is_match ? 'appear to match' : 'do not match'
    } the verification threshold of ${data.threshold}%.`,
    keyFindings: [
      `Match Score: ${data.match_score}% (Threshold: ${data.threshold}%)`,
      `Confidence Level: ${confidence}`,
      `Fraud Risk: ${isFraud}`,
      `Dominant Quality Metric: ${data.dominant_metric || 'Multi-feature'}`,
      `Overall Status: ${data.status}`,
    ],
    riskAssessment: `The fraud detection system indicates a ${isFraud} risk of fraudulent signature. ${
      data.fraud_signals && data.fraud_signals.length > 0
        ? `Detected signals: ${data.fraud_signals.join(', ')}`
        : 'No major fraud signals detected.'
    }`,
    recommendations:
      data.is_match && data.match_score >= data.threshold
        ? 'Signature is verified. No additional verification required.'
        : 'Consider additional verification steps or manual review by an expert.',
    technicalNotes: `Analysis based on multiple biometric features including structural similarity (${data.breakdown.structural_similarity || 'N/A'}%), stroke geometry (${data.breakdown.stroke_geometry_similarity || 'N/A'}%), and pressure patterns.`,
  };
};

/**
 * Generate signature insights
 */
export const generateSignatureInsights = (data) => {
  const insights = [];

  if (data.match_score >= 95) {
    insights.push({
      type: 'success',
      icon: '✓',
      text: 'Exceptional Match - Signatures are nearly identical',
    });
  } else if (data.match_score >= 85) {
    insights.push({
      type: 'success',
      icon: '✓',
      text: 'Strong Match - High confidence verification',
    });
  } else if (data.match_score >= 70) {
    insights.push({
      type: 'warning',
      icon: '⚠',
      text: 'Partial Match - May need additional verification',
    });
  } else {
    insights.push({
      type: 'error',
      icon: '✗',
      text: 'Poor Match - Signatures do not appear to be from the same person',
    });
  }

  if (data.metric_variance > 20) {
    insights.push({
      type: 'warning',
      icon: '⚠',
      text: 'High Variance - Quality varies significantly across metrics',
    });
  }

  if (data.fraud_probability > 30) {
    insights.push({
      type: 'error',
      icon: '🚨',
      text: `High Fraud Risk (${Math.round(data.fraud_probability)}%) - Manual review recommended`,
    });
  }

  return insights;
};
