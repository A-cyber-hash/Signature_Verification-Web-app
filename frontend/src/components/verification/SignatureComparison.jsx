import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Button, Typography, CircularProgress,
  Alert, Grid, Divider, Tooltip, IconButton, LinearProgress, Chip, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  CameraAlt, Upload, Replay, CheckCircle, Cancel, FlipCameraAndroid,
  CompareArrows, CloudUpload, SwapHoriz, Download, FileDownload, Print, GetApp, Sparkles, Settings,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell, LineChart, Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { verificationAPI } from '@services/api';
import toast from 'react-hot-toast';

const cardSx = { background: 'linear-gradient(145deg,#1e293b,#1a1f2e)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 };

// Generate PDF Report
const generatePDFReport = (result) => {
  try {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SignaSecure Comparison Report', margin, yPosition + 15);

    // Date
    yPosition += 35;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);

    // Summary Section
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('COMPARISON RESULT', margin, yPosition);
    yPosition += 10;

    // Result Status
    doc.setFillColor(result.is_match ? 16 : 239, result.is_match ? 185 : 68, result.is_match ? 129 : 68);
    doc.rect(margin, yPosition, 30, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(result.is_match ? '✓ MATCH' : '✗ NO MATCH', margin + 2, yPosition + 10);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Status: ${result.status}`, margin + 40, yPosition + 10);

    // Match Score
    yPosition += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Accuracy Score:', margin, yPosition);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(result.is_match ? 16 : 239, result.is_match ? 185 : 68, result.is_match ? 129 : 68);
    doc.text(`${result.match_score}%`, margin + 50, yPosition);

    yPosition += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Threshold: ${result.threshold}%`, margin, yPosition);

    // Metrics Breakdown
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Metric Breakdown:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    Object.entries(result.breakdown).forEach(([key, value]) => {
      const metricName = key.replace(/_/g, ' ').toUpperCase();
      doc.text(`${metricName}: ${value}%`, margin + 2, yPosition);
      yPosition += 6;
    });

    // Confidence & Fraud
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Additional Information:', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Confidence Level: ${result.confidence_label}`, margin + 2, yPosition);
    yPosition += 6;
    doc.text(`Fraud Flag: ${result.fraud_flag ? 'YES ⚠️' : 'NO'}`, margin + 2, yPosition);
    yPosition += 6;
    doc.text(`Processing Time: ${result.processing_time_s}s`, margin + 2, yPosition);

    // Explanation
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Analysis:', margin, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const wrappedText = doc.splitTextToSize(result.explanation, pageWidth - 2 * margin);
    doc.text(wrappedText, margin, yPosition);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('SignaSecure Enterprise © 2024', margin, pageHeight - 10);

    // Save
    doc.save(`signature_comparison_${new Date().getTime()}.pdf`);
    toast.success('✅ PDF Report downloaded successfully!');
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Failed to generate PDF report');
  }
};

// Generate CSV Report
const generateCSVReport = (result) => {
  try {
    const csvContent = [
      ['Signature Comparison Report'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Result', result.is_match ? 'MATCH' : 'NO MATCH'],
      ['Status', result.status],
      ['Match Score', `${result.match_score}%`],
      ['Threshold', `${result.threshold}%`],
      ['Confidence', result.confidence_label],
      ['Fraud Flag', result.fraud_flag ? 'YES' : 'NO'],
      ['Processing Time', `${result.processing_time_s}s`],
      [],
      ['Metric', 'Score (%)'],
      ...Object.entries(result.breakdown).map(([key, val]) => [
        key.replace(/_/g, ' ').toUpperCase(),
        val,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature_comparison_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('✅ CSV Report downloaded!');
  } catch (error) {
    console.error('CSV generation error:', error);
    toast.error('Failed to generate CSV report');
  }
};

export default function SignatureComparison() {
  // Refs
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const stream1Ref = useRef(null);
  const stream2Ref = useRef(null);

  // State
  const [sig1, setSig1] = useState(null); // base64
  const [sig2, setSig2] = useState(null);
  const [camera1On, setCamera1On] = useState(false);
  const [camera2On, setCamera2On] = useState(false);
  const [facingMode1, setFacingMode1] = useState('environment');
  const [facingMode2, setFacingMode2] = useState('environment');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1=capture, 2=compare, 3=result

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
      setError(`Camera ${cameraNum} access denied. Please allow permissions.`);
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

  // Compare
  const handleCompare = async () => {
    if (!sig1 || !sig2) {
      setError('Please capture or upload both signatures.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verificationAPI.compareSignatures(sig1, sig2);
      setResult(res.data);
      setActiveStep(3);
      if (res.data.is_match) {
        toast.success(`✅ Signatures Match! ${res.data.match_score}% accuracy`);
      } else {
        toast.error(`❌ Signatures Don't Match — ${res.data.match_score}% accuracy`);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const reset = () => {
    setSig1(null);
    setSig2(null);
    setResult(null);
    setError('');
    stopCamera(1);
    stopCamera(2);
    setActiveStep(1);
  };

  // Radar chart data
  const radarData = result
    ? Object.entries(result.breakdown).map(([key, val]) => ({
        metric: key.replace(/_/g, ' ').toUpperCase(),
        score: Math.round(val),
        fullMark: 100,
      }))
    : [];

  // Bar chart data (for metric comparison)
  const barData = radarData.slice(0, 6);

  // Signature Capture Panel
  const SignaturePanel = ({ label, cameraNum, sig, cameraOn, facingMode }) => (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
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
          <canvas
            ref={cameraNum === 1 ? canvas1Ref : canvas2Ref}
            style={{ display: 'none' }}
          />

          {/* Camera Controls */}
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

        {/* Buttons */}
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
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          Signature Comparison Tool
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Capture or upload two signatures and compare with full accuracy metrics using advanced ML analysis
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Steps Indicator */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['Capture Both', 'Compare', 'Results'].map((s, i) => (
          <Chip
            key={s}
            label={`${i + 1}. ${s}`}
            size="small"
            sx={{
              background: activeStep > i ? 'linear-gradient(135deg,#14b8a6,#0ea5e9)' : 'rgba(255,255,255,0.05)',
              color: activeStep > i ? '#fff' : 'text.secondary',
              fontWeight: activeStep > i ? 600 : 400,
              border: 'none',
            }}
          />
        ))}
      </Box>

      {/* Main Content */}
      {activeStep < 3 ? (
        <Grid container spacing={2.5}>
          {/* Signature 1 */}
          <Grid item xs={12} md={6}>
            <SignaturePanel label="Signature 1" cameraNum={1} sig={sig1} cameraOn={camera1On} />
          </Grid>

          {/* Signature 2 */}
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
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={2.5}>
                {/* Match Status Card */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      ...cardSx,
                      border: `2px solid ${result.is_match ? '#10b981' : '#ef4444'}`,
                      background: result.is_match ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
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
                        size="medium"
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

                      {/* Score Bar */}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                          <span>0%</span>
                          <span>Threshold: {result.threshold}%</span>
                          <span>100%</span>
                        </Box>
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />

                      {/* Confidence & Fraud */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Chip
                          size="small"
                          label={`Confidence: ${result.confidence_label}`}
                          sx={{
                            background: 'rgba(20,184,166,0.15)',
                            color: '#a5b4fc',
                            fontSize: '0.8rem',
                            border: 'none',
                          }}
                        />
                        {result.fraud_flag && (
                          <Chip
                            size="small"
                            label="⚠️ Fraud Detected"
                            sx={{
                              background: 'rgba(239,68,68,0.2)',
                              color: '#ef4444',
                              fontSize: '0.8rem',
                              border: 'none',
                            }}
                          />
                        )}
                      </Box>

                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6, display: 'block' }}>
                        {result.explanation}
                      </Typography>

                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, display: 'block' }}>
                        ⏱ Processing time: {result.processing_time_s}s
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Metrics Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card sx={cardSx}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        📊 Metric Breakdown
                      </Typography>

                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                          <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
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
                              <Cell
                                key={`cell-${index}`}
                                fill={result.is_match ? '#10b981' : '#f97316'}
                              />
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
                        🎯 Detailed Metrics (Radar Analysis)
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

                {/* Dominant & Weakest Metrics */}
                <Grid item xs={12} md={6}>
                  <Card sx={cardSx}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        🏆 Strongest Metric
                      </Typography>
                      <Box sx={{ p: 1.5, background: 'rgba(16,185,129,0.1)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          {result.dominant_metric}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#10b981' }}>
                          {Object.entries(result.breakdown).find(([key]) => key === result.dominant_metric?.toLowerCase().replace(/ /g, '_'))?.[1] || 'N/A'}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={cardSx}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        ⚠️ Weakest Metric
                      </Typography>
                      <Box sx={{ p: 1.5, background: 'rgba(239,68,68,0.1)', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          {result.weakest_metric}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#ef4444' }}>
                          {Object.entries(result.breakdown).find(([key]) => key === result.weakest_metric?.toLowerCase().replace(/ /g, '_'))?.[1] || 'N/A'}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={reset}
                      sx={{
                        background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                        borderRadius: 2,
                        py: 1.2,
                        px: 4,
                      }}
                    >
                      Compare Again
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={() => generatePDFReport(result)}
                      sx={{
                        borderColor: '#f7971e',
                        color: '#f7971e',
                        borderRadius: 2,
                        py: 1.2,
                        px: 4,
                        '&:hover': { 
                          background: 'rgba(247, 151, 30, 0.1)',
                          borderColor: '#ffd200',
                        },
                      }}
                    >
                      📄 PDF Report
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => generateCSVReport(result)}
                      sx={{
                        borderColor: '#14b8a6',
                        color: '#14b8a6',
                        borderRadius: 2,
                        py: 1.2,
                        px: 4,
                        '&:hover': { 
                          background: 'rgba(20, 184, 166, 0.1)',
                          borderColor: '#0ea5e9',
                        },
                      }}
                    >
                      📊 CSV Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  );
}
