import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CameraAlt,
  FlipCameraAndroid,
  Upload,
  Replay,
  Fingerprint,
  CompareArrows,
  CheckCircle,
  Cancel,
  Close,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { verificationAPI } from '../../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

const cardSx = {
  background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 3,
};

const SignatureUploadBox = ({ title, onImageCapture, image, onClear, loading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (e) {
      toast.error('Camera access denied');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const imageData = c.toDataURL('image/png');
    onImageCapture(imageData);
    stopCamera();
  }, [onImageCapture, stopCamera]);

  const flipCamera = useCallback(async () => {
    stopCamera();
    setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'));
    setTimeout(startCamera, 300);
  }, [startCamera, stopCamera]);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageCapture(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {title}
        </Typography>

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
          {!cameraOn && !image && (
            <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
              <CameraAlt sx={{ fontSize: 64, mb: 1 }} />
              <Typography variant="body2">
                Capture or upload signature
              </Typography>
            </Box>
          )}

          <video
            ref={videoRef}
            style={{ display: cameraOn ? 'block' : 'none', width: '100%', maxHeight: 300, objectFit: 'cover' }}
            playsInline
            muted
          />

          {image && !cameraOn && (
            <motion.img
              src={image}
              alt="signature"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12 }}
            />
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {cameraOn && (
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 1 }}>
              <Tooltip title="Flip Camera">
                <IconButton
                  onClick={flipCamera}
                  sx={{
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <FlipCameraAndroid />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {image && (
            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
              <Tooltip title="Clear">
                <IconButton
                  onClick={onClear}
                  sx={{
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {!cameraOn && !image && (
            <>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={startCamera}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                }}
              >
                Open Camera
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Upload />}
                component="label"
                disabled={loading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#14b8a6',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                }}
              >
                Upload Image
                <input type="file" accept="image/*" onChange={handleUpload} hidden />
              </Button>
            </>
          )}
          {cameraOn && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={capturePhoto}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.2,
              }}
            >
              Capture Photo
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Save verification to history
const saveVerificationToHistory = (type, matchScore, isMatch) => {
  const history = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
  history.unshift({
    type,
    matchScore,
    status: isMatch ? 'match' : 'no_match',
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem('verificationHistory', JSON.stringify(history.slice(0, 50)));
  // Trigger storage event for dashboard update
  window.dispatchEvent(new Event('verificationUpdated'));
};

export default function VerificationPage() {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Tab 0: Verify with Template
  const [templateImage, setTemplateImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [templateResult, setTemplateResult] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState('');

  // Tab 1: Compare Two Signatures
  const [sig1, setSig1] = useState(null);
  const [sig2, setSig2] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await verificationAPI.getTemplates();
      setTemplates(res.data?.templates || []);
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  };

  // Tab 0: Verify with Template
  const handleVerifyWithTemplate = async () => {
    if (!selectedTemplate || !capturedImage) {
      setTemplateError('Select a template and capture/upload a signature');
      return;
    }

    setTemplateLoading(true);
    setTemplateError('');

    try {
      const res = await verificationAPI.verifySignature(selectedTemplate, capturedImage);
      setTemplateResult(res.data);
      
      // Save to history for dashboard
      saveVerificationToHistory('verify', res.data.match_score, res.data.is_verified);
      
      toast.success(`✅ Verified! ${res.data.match_score}% match`);
    } catch (e) {
      const errorMsg = e?.response?.data?.error || 'Verification failed';
      setTemplateError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Tab 1: Compare Two Signatures
  const handleCompareSignatures = async () => {
    if (!sig1 || !sig2) {
      setCompareError('Upload both signatures to compare');
      return;
    }

    setCompareLoading(true);
    setCompareError('');

    try {
      const res = await verificationAPI.compareSignatures(sig1, sig2);
      setCompareResult(res.data);
      
      // Save to history for dashboard
      saveVerificationToHistory('compare', res.data.match_score, res.data.is_match);
      
      toast.success(`✅ Comparison complete! ${res.data.match_score}% match`);
    } catch (e) {
      const errorMsg = e?.response?.data?.error || 'Comparison failed';
      setCompareError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setCompareLoading(false);
    }
  };

  const radarData = (breakdown) =>
    breakdown
      ? Object.entries(breakdown)
          .filter(([, val]) => typeof val === 'number')
          .map(([key, val]) => ({
            metric: key
              .replace(/_/g, ' ')
              .replace(/similarity|match/gi, '')
              .trim()
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            score: Math.min(100, Math.max(0, val)),
            fullMark: 100,
          }))
      : [];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', minWidth: 0, p: 1 }}
        />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Signature Verification
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Verify signatures with templates or compare two signatures
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)', mb: 3, px: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              '&.Mui-selected': { color: '#14b8a6' },
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
            },
          }}
        >
          <Tab label="🔍 Verify with Template" icon={<Fingerprint />} iconPosition="start" />
          <Tab label="⚖️ Compare Two Signatures" icon={<CompareArrows />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Verify with Template */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ px: 2 }}>
          {templateError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setTemplateError('')}>
              {templateError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Template Selection */}
            <Grid item xs={12} lg={4}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    📋 Select Template
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: 'text.secondary' }}>Select Template</InputLabel>
                    <Select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      label="Select Template"
                      sx={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14b8a6',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#14b8a6',
                        },
                      }}
                    >
                      {templates && templates.length > 0 ? (
                        templates.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No templates available</MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerifyWithTemplate}
                    disabled={!selectedTemplate || !capturedImage || templateLoading}
                    sx={{
                      background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    {templateLoading && <CircularProgress size={20} sx={{ color: '#fff' }} />}
                    {templateLoading ? 'Verifying...' : '🔍 Verify Signature'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Capture/Upload Signature */}
            <Grid item xs={12} lg={8}>
              <SignatureUploadBox
                title="📷 Capture or Upload Signature"
                onImageCapture={setCapturedImage}
                image={capturedImage}
                onClear={() => setCapturedImage(null)}
                loading={templateLoading}
              />
            </Grid>
          </Grid>

          {/* Results */}
          {templateResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card sx={{ ...cardSx, mt: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    {templateResult.is_verified ? (
                      <CheckCircle sx={{ fontSize: 40, color: '#10b981' }} />
                    ) : (
                      <Cancel sx={{ fontSize: 40, color: '#ef4444' }} />
                    )}
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {templateResult.is_verified ? '✅ Verified' : '❌ Not Verified'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Match Score: {templateResult.match_score}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        Confidence: {templateResult.confidence_label || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {radarData(templateResult.breakdown).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                        📊 Analysis Breakdown
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData(templateResult.breakdown)}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                          <Radar name="Score" dataKey="score" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}

                  {templateResult.fraud_signals && templateResult.fraud_signals.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        🚨 Fraud Signals Detected
                      </Typography>
                      <Typography variant="caption">
                        {templateResult.fraud_signals.join(', ')}
                      </Typography>
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={() => {
                      setTemplateResult(null);
                      setCapturedImage(null);
                      setSelectedTemplate('');
                    }}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#14b8a6',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Verify Another
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Box>
      </TabPanel>

      {/* Tab 1: Compare Two Signatures */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ px: 2 }}>
          {compareError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setCompareError('')}>
              {compareError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Signature 1 */}
            <Grid item xs={12} lg={6}>
              <SignatureUploadBox
                title="📷 Signature 1"
                onImageCapture={setSig1}
                image={sig1}
                onClear={() => setSig1(null)}
                loading={compareLoading}
              />
            </Grid>

            {/* Signature 2 */}
            <Grid item xs={12} lg={6}>
              <SignatureUploadBox
                title="📷 Signature 2"
                onImageCapture={setSig2}
                image={sig2}
                onClear={() => setSig2(null)}
                loading={compareLoading}
              />
            </Grid>

            {/* Compare Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCompareSignatures}
                disabled={!sig1 || !sig2 || compareLoading}
                sx={{
                  background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {compareLoading && <CircularProgress size={24} sx={{ color: '#fff' }} />}
                {compareLoading ? 'Comparing...' : '⚖️ Compare Signatures'}
              </Button>
            </Grid>
          </Grid>

          {/* Comparison Results */}
          {compareResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card sx={{ ...cardSx, mt: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    {compareResult.is_match ? (
                      <CheckCircle sx={{ fontSize: 40, color: '#10b981' }} />
                    ) : (
                      <Cancel sx={{ fontSize: 40, color: '#ef4444' }} />
                    )}
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {compareResult.is_match ? '✅ Signatures Match' : '❌ Signatures Do Not Match'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Match Score: {compareResult.match_score}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        Confidence: {compareResult.confidence_label || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {radarData(compareResult.breakdown).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                        📊 Comparison Analysis
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData(compareResult.breakdown)}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                          <Radar name="Score" dataKey="score" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}

                  {compareResult.fraud_signals && compareResult.fraud_signals.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        🚨 Fraud Signals Detected
                      </Typography>
                      <Typography variant="caption">
                        {compareResult.fraud_signals.join(', ')}
                      </Typography>
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={() => {
                      setCompareResult(null);
                      setSig1(null);
                      setSig2(null);
                    }}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#14b8a6',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Compare Another
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Box>
      </TabPanel>
    </Box>
  );
}
