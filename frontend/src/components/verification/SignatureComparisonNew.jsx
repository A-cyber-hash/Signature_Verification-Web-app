import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Button, Typography, CircularProgress,
  Alert, Grid, Divider, Tooltip, IconButton, LinearProgress, Chip, Stepper, Step, StepLabel,
} from '@mui/material';
import {
  CameraAlt, Upload, Replay, CheckCircle, Cancel, FlipCameraAndroid,
  CompareArrows, SwapHoriz, Download, Sparkles, GetApp, ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { verificationAPI } from '@services/api';
import { generateAIAnalysis, generateSignatureInsights } from '@services/aiAnalysis';
import toast from 'react-hot-toast';

const cardSx = {
  background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 3,
};

const STEPS = ['Upload Signatures', 'Compare', 'Generate Report'];

export default function SignatureComparison() {
  // Refs
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const stream1Ref = useRef(null);
  const stream2Ref = useRef(null);
  const reportRef = useRef(null);

  // State
  const [sig1, setSig1] = useState(null);
  const [sig2, setSig2] = useState(null);
  const [camera1On, setCamera1On] = useState(false);
  const [camera2On, setCamera2On] = useState(false);
  const [facingMode1, setFacingMode1] = useState('environment');
  const [facingMode2, setFacingMode2] = useState('environment');
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Start Camera
  const startCamera = useCallback(async (cameraNum) => {
    const videoRef = cameraNum === 1 ? video1Ref : video2Ref;
    const streamRef = cameraNum === 1 ? stream1Ref : stream2Ref;
    const facingMode = cameraNum === 1 ? facingMode1 : facingMode2;
    const setCamera = cameraNum === 1 ? setCamera1On : setCamera2On;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCamera(true);
    } catch {
      setError(`Camera ${cameraNum} access denied.`);
    }
  }, [facingMode1, facingMode2]);

  // Stop Camera
  const stopCamera = useCallback((cameraNum) => {
    const streamRef = cameraNum === 1 ? stream1Ref : stream2Ref;
    const setCamera = cameraNum === 1 ? setCamera1On : setCamera2On;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamera(false);
  }, []);

  // Flip Camera
  const flipCamera = useCallback((cameraNum) => {
    if (cameraNum === 1) {
      stopCamera(1);
      setFacingMode1(f => f === 'environment' ? 'user' : 'environment');
      setTimeout(() => startCamera(1), 300);
    } else {
      stopCamera(2);
      setFacingMode2(f => f === 'environment' ? 'user' : 'environment');
      setTimeout(() => startCamera(2), 300);
    }
  }, [startCamera, stopCamera]);

  // Capture Photo
  const capturePhoto = useCallback((cameraNum) => {
    const videoRef = cameraNum === 1 ? video1Ref : video2Ref;
    const canvasRef = cameraNum === 1 ? canvas1Ref : canvas2Ref;
    if (!videoRef.current || !canvasRef.current) return;

    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const base64 = c.toDataURL('image/png');

    if (cameraNum === 1) {
      setSig1(base64);
      stopCamera(1);
    } else {
      setSig2(base64);
      stopCamera(2);
    }
  }, [stopCamera]);

  // Upload Image
  const handleUpload = (e, cameraNum) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (cameraNum === 1) setSig1(ev.target.result);
      else setSig2(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Swap Signatures
  const swapSignatures = () => {
    const temp = sig1;
    setSig1(sig2);
    setSig2(temp);
  };

  // Compare Signatures
  const handleCompare = async () => {
    if (!sig1 || !sig2) {
      setError('Please upload both signatures.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verificationAPI.compareSignatures(sig1, sig2);
      setResult(res.data);
      setCurrentStep(2); // Move to report generation

      // Generate AI analysis in background
      generateAIInsights(res.data);

      toast.success('✅ Comparison complete! Ready to generate report.');
    } catch (e) {
      setError(e.response?.data?.error || 'Comparison failed.');
      toast.error('❌ Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI Insights
  const generateAIInsights = async (resultData) => {
    try {
      const analysis = await generateAIAnalysis(resultData);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI Analysis Error:', error);
    }
  };

  // Generate and Download Report
  const generateAndDownloadReport = async () => {
    if (!result || !reportRef.current) return;

    setGeneratingReport(true);
    try {
      // Create PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Header with gradient effect (simulated)
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont(undefined, 'bold');
      doc.text('🔐 SignaSecure', margin, yPosition + 12);
      doc.setFontSize(12);
      doc.text('Signature Comparison Report', margin, yPosition + 22);

      // Date
      yPosition = 50;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);

      // Status Badge
      yPosition += 15;
      const statusColor = result.is_match ? [16, 185, 129] : [239, 68, 68];
      doc.setFillColor(...statusColor);
      doc.rect(margin, yPosition, 35, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(result.is_match ? '✓ MATCH' : '✗ NO MATCH', margin + 2, yPosition + 8);

      // Match Score Section
      yPosition += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('ACCURACY ANALYSIS', margin, yPosition);

      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Match Score: ${result.match_score}%`, margin, yPosition);
      yPosition += 6;
      doc.text(`Threshold: ${result.threshold}%`, margin, yPosition);
      yPosition += 6;
      doc.text(`Status: ${result.status}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Confidence: ${result.confidence_label}`, margin, yPosition);

      // Metrics Table
      yPosition += 12;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('METRIC BREAKDOWN', margin, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const metrics = Object.entries(result.breakdown || {});
      metrics.forEach(([key, value], index) => {
        const metricName = key.replace(/_/g, ' ').toUpperCase();
        doc.text(`${metricName}: ${value}%`, margin + 2, yPosition);
        yPosition += 6;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
      });

      // AI Insights
      if (aiAnalysis && aiAnalysis.success !== false) {
        yPosition += 10;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('AI-POWERED ANALYSIS', margin, yPosition);

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Summary:', margin, yPosition);
        yPosition += 5;
        const summaryLines = doc.splitTextToSize(aiAnalysis.summary || 'Analysis unavailable', pageWidth - 2 * margin);
        doc.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 5;

        // Key Findings
        doc.setFont(undefined, 'bold');
        doc.text('Key Findings:', margin, yPosition);
        yPosition += 5;
        doc.setFont(undefined, 'normal');
        (aiAnalysis.keyFindings || []).forEach(finding => {
          const lines = doc.splitTextToSize(`• ${finding}`, pageWidth - 2 * margin - 5);
          doc.text(lines, margin + 2, yPosition);
          yPosition += lines.length * 4 + 2;
        });

        // Risk Assessment
        yPosition += 3;
        doc.setFont(undefined, 'bold');
        doc.text('Risk Assessment:', margin, yPosition);
        yPosition += 5;
        doc.setFont(undefined, 'normal');
        const riskLines = doc.splitTextToSize(aiAnalysis.riskAssessment || 'N/A', pageWidth - 2 * margin);
        doc.text(riskLines, margin, yPosition);
        yPosition += riskLines.length * 5 + 3;

        // Recommendations
        doc.setFont(undefined, 'bold');
        doc.text('Recommendations:', margin, yPosition);
        yPosition += 5;
        doc.setFont(undefined, 'normal');
        const recLines = doc.splitTextToSize(aiAnalysis.recommendations || 'N/A', pageWidth - 2 * margin);
        doc.text(recLines, margin, yPosition);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by SignaSecure Enterprise • Confidential`,
        margin,
        pageHeight - 10
      );

      // Download
      doc.save(`signature_comparison_${Date.now()}.pdf`);
      toast.success('✅ Report downloaded successfully!');
    } catch (error) {
      console.error('Report Generation Error:', error);
      toast.error('❌ Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Reset
  const reset = () => {
    setSig1(null);
    setSig2(null);
    setResult(null);
    setAiAnalysis(null);
    setError('');
    stopCamera(1);
    stopCamera(2);
    setCurrentStep(0);
  };

  // Signature Panel Component
  const SignaturePanel = ({ label, cameraNum, sig, cameraOn }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * cameraNum }}>
      <Card sx={cardSx}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {cameraNum === 1 ? '📋' : '📄'} {label}
          </Typography>

          {/* Viewfinder */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#0a0e1a',
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.06)',
              mb: 2,
            }}
          >
            {!cameraOn && !sig && (
              <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                <CameraAlt sx={{ fontSize: 64, mb: 1 }} />
                <Typography variant="body2">Click Open Camera or Upload</Typography>
              </Box>
            )}
            <video
              ref={cameraNum === 1 ? video1Ref : video2Ref}
              style={{ display: cameraOn ? 'block' : 'none', width: '100%', maxHeight: 300, objectFit: 'cover' }}
              playsInline
              muted
            />
            {sig && !cameraOn && (
              <motion.img
                src={sig}
                alt={`signature-${cameraNum}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12 }}
              />
            )}
            <canvas ref={cameraNum === 1 ? canvas1Ref : canvas2Ref} style={{ display: 'none' }} />

            {cameraOn && (
              <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                <Tooltip title="Flip Camera">
                  <IconButton
                    onClick={() => flipCamera(cameraNum)}
                    sx={{ background: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { background: 'rgba(0,0,0,0.7)' } }}
                  >
                    <FlipCameraAndroid />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {!cameraOn ? (
              <Button
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={() => startCamera(cameraNum)}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                }}
              >
                Open Camera
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => capturePhoto(cameraNum)}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg,#10b981,#a3e635)',
                  color: '#000',
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1,
                }}
              >
                📸 Capture
              </Button>
            )}
            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload />}
              fullWidth
              sx={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: 'text.primary',
                borderRadius: 2,
                py: 1,
                '&:hover': { borderColor: '#14b8a6' },
              }}
            >
              Upload
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => handleUpload(e, cameraNum)}
              />
            </Button>
            {(sig || cameraOn) && (
              <Button
                variant="outlined"
                startIcon={<Replay />}
                onClick={() => {
                  if (cameraNum === 1) setSig1(null);
                  else setSig2(null);
                  stopCamera(cameraNum);
                }}
                sx={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'text.secondary',
                  borderRadius: 2,
                  py: 1,
                }}
              >
                Reset
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Result Display Component
  const ResultDisplay = () => {
    const radarData = result
      ? Object.entries(result.breakdown).map(([key, val]) => ({
          metric: key.replace(/_/g, ' ').toUpperCase(),
          score: Math.round(val),
          fullMark: 100,
        }))
      : [];

    const barData = radarData.slice(0, 6);
    const insights = generateSignatureInsights(result);

    return (
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Grid container spacing={2.5} ref={reportRef}>
              {/* Main Status Card */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    ...cardSx,
                    border: `2px solid ${result.is_match ? '#10b981' : '#ef4444'}`,
                    background: result.is_match ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      {result.is_match ? (
                        <CheckCircle sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
                      ) : (
                        <Cancel sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
                      )}
                    </motion.div>

                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                      {result.is_match ? '✅ SIGNATURES MATCH' : '❌ NO MATCH'}
                    </Typography>

                    <Chip
                      label={result.status}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        px: 2,
                        background: result.is_match ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: result.is_match ? '#10b981' : '#ef4444',
                        border: 'none',
                        mb: 2,
                      }}
                    />

                    {/* Score */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Accuracy Score
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: result.is_match ? '#10b981' : '#ef4444' }}
                        >
                          {result.match_score}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={result.match_score}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.08)',
                          '& .MuiLinearProgress-bar': {
                            background: result.is_match
                              ? 'linear-gradient(90deg,#10b981,#a3e635)'
                              : 'linear-gradient(90deg,#ff416c,#ff4b2b)',
                            borderRadius: 6,
                          },
                        }}
                      />
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />

                    {/* Insights */}
                    <Box sx={{ textAlign: 'left' }}>
                      {insights.map((insight, idx) => (
                        <Alert
                          key={idx}
                          severity={insight.type}
                          sx={{ mb: 1, fontSize: '0.85rem', borderRadius: 1 }}
                        >
                          {insight.text}
                        </Alert>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Metrics Bar Chart */}
              <Grid item xs={12} md={6}>
                <Card sx={cardSx}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      📊 Metric Scores
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <RTooltip
                          contentStyle={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: 8,
                          }}
                          formatter={(value) => [`${value}%`]}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={result.is_match ? '#10b981' : '#f97316'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Radar Chart */}
              <Grid item xs={12}>
                <Card sx={cardSx}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      🎯 Detailed Analysis
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke={result.is_match ? '#14b8a6' : '#f97316'}
                          fill={result.is_match ? '#14b8a6' : '#f97316'}
                          fillOpacity={0.25}
                          strokeWidth={2}
                        />
                        <RTooltip
                          contentStyle={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: 8,
                          }}
                          formatter={(value) => [`${value}%`]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* AI Analysis */}
              {aiAnalysis && (
                <Grid item xs={12}>
                  <Card sx={{ ...cardSx, background: 'linear-gradient(145deg,#1e2f4d,#1a2d4a)' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Sparkles sx={{ color: '#fbbf24', fontSize: 24 }} />
                        <Typography variant="h6" fontWeight={700}>
                          AI-Powered Insights
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1.5, color: '#e0e7ff' }}>
                        {aiAnalysis.summary}
                      </Typography>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fbbf24', mb: 1 }}>
                          Key Findings:
                        </Typography>
                        {(aiAnalysis.keyFindings || []).map((finding, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'block', mb: 0.5, color: '#d1d5db' }}>
                            • {finding}
                          </Typography>
                        ))}
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />

                      <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
                        <strong>Risk Assessment:</strong> {aiAnalysis.riskAssessment}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={generatingReport ? <CircularProgress size={20} /> : <GetApp />}
                    onClick={generateAndDownloadReport}
                    disabled={generatingReport}
                    sx={{
                      background: 'linear-gradient(135deg,#f7971e,#ffd200)',
                      color: '#000',
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 1.2,
                      px: 4,
                    }}
                  >
                    {generatingReport ? 'Generating...' : '📄 Download PDF Report'}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={reset}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'text.primary',
                      borderRadius: 2,
                      py: 1.2,
                      px: 4,
                    }}
                  >
                    Compare Again
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          Signature Comparison Tool
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Advanced AI-powered signature analysis with intelligent report generation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Box sx={{ mb: 3 }}>
        <Stepper
          activeStep={currentStep}
          sx={{
            background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
            padding: 2,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.06)',
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiStepLabel-label.Mui-active': { color: '#14b8a6', fontWeight: 600 },
            '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.2)' },
            '& .MuiStepIcon-root.Mui-active': { color: '#14b8a6' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      {currentStep < 2 ? (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SignaturePanel label="Signature 1" cameraNum={1} sig={sig1} cameraOn={camera1On} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SignaturePanel label="Signature 2" cameraNum={2} sig={sig2} cameraOn={camera2On} />
          </Grid>

          {/* Controls */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {sig1 && sig2 && (
                <Button
                  variant="outlined"
                  startIcon={<SwapHoriz />}
                  onClick={swapSignatures}
                  sx={{
                    borderColor: '#14b8a6',
                    color: '#14b8a6',
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                  }}
                >
                  Swap Signatures
                </Button>
              )}

              <Button
                variant="contained"
                startIcon={<CompareArrows />}
                onClick={handleCompare}
                disabled={loading || !sig1 || !sig2}
                sx={{
                  background: 'linear-gradient(135deg,#f7971e,#ffd200)',
                  color: '#000',
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.2,
                  px: 4,
                  fontSize: '1rem',
                  minWidth: 200,
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : '🔍 Compare'}
              </Button>

              <Button
                variant="outlined"
                onClick={reset}
                sx={{
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'text.secondary',
                  borderRadius: 2,
                  py: 1.2,
                  px: 3,
                }}
              >
                Reset All
              </Button>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <ResultDisplay />
      )}
    </Box>
  );
}
