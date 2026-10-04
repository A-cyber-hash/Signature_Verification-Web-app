import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PhotoCamera,
  Close,
  FlipCameraAndroid,
} from '@mui/icons-material';
import { useLanguage } from '@context/LanguageContext';

export default function CameraSystem() {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [stream, setStream] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      setError(t('cameraPermission'));
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      setShowPreview(true);
      stopCamera();
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    stopCamera();
    setTimeout(() => startCamera(), 500);
  };

  const processWithAI = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResult = {
        genuine: Math.random() > 0.3,
        confidence: (Math.random() * 30 + 70).toFixed(1),
        quality: (Math.random() * 20 + 80).toFixed(1),
        features: {
          pressure: (Math.random() * 30 + 70).toFixed(1),
          speed: (Math.random() * 30 + 70).toFixed(1),
          angle: (Math.random() * 30 + 70).toFixed(1),
        },
      };

      setAiResult(mockResult);
    } catch (err) {
      setError('AI processing failed');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setAiResult(null);
    setShowPreview(false);
    startCamera();
  };

  const usePhoto = () => {
    processWithAI();
  };

  return (
    <Box sx={{ p: 2 }}>
      {cameraActive && (
        <Card sx={{ mb: 2, background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)' }}>
          <CardContent sx={{ p: 0, position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                display: 'block',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
                justifyContent: 'center',
                px: 2,
              }}
            >
              <Tooltip title={t('retake')}>
                <IconButton
                  onClick={stopCamera}
                  sx={{
                    bgcolor: 'rgba(239,68,68,.2)',
                    color: '#ef4444',
                    '&:hover': { bgcolor: 'rgba(239,68,68,.3)' },
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<PhotoCamera />}
                onClick={capturePhoto}
                sx={{
                  background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                {t('takePhoto')}
              </Button>

              <Tooltip title="Flip Camera">
                <IconButton
                  onClick={toggleCamera}
                  sx={{
                    bgcolor: 'rgba(20,184,166,.2)',
                    color: '#14b8a6',
                    '&:hover': { bgcolor: 'rgba(20,184,166,.3)' },
                  }}
                >
                  <FlipCameraAndroid />
                </IconButton>
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>
      )}

      {!cameraActive && !capturedImage && (
        <Button
          variant="contained"
          startIcon={<PhotoCamera />}
          onClick={startCamera}
          fullWidth
          sx={{
            background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
            mb: 2,
          }}
        >
          {t('openCamera')}
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('verificationResult')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {capturedImage && (
            <Box>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  marginBottom: '16px',
                }}
              />

              {loading && (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress sx={{ color: '#14b8a6' }} />
                  <Typography color="text.secondary">{t('loading')}</Typography>
                </Stack>
              )}

              {aiResult && (
                <Stack spacing={2}>
                  <Card sx={{ background: 'rgba(20,184,166,.1)', border: '1px solid rgba(20,184,166,.3)' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={800}>
                          {aiResult.genuine ? t('genuine') : t('forged')}
                        </Typography>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: aiResult.genuine ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: aiResult.genuine ? '#10b981' : '#ef4444',
                            fontSize: '1.5rem',
                          }}
                        >
                          {aiResult.genuine ? '✓' : '✗'}
                        </Box>
                      </Stack>

                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('confidence')}
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {aiResult.confidence}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Quality
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {aiResult.quality}%
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Feature Analysis
                        </Typography>
                        <Stack spacing={0.5}>
                          {Object.entries(aiResult.features).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {key}
                              </Typography>
                              <Typography variant="caption" fontWeight={600}>
                                {value}%
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={retakePhoto} variant="outlined">
            {t('retake')}
          </Button>
          {!aiResult && (
            <Button
              onClick={usePhoto}
              variant="contained"
              disabled={loading}
              sx={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}
            >
              {loading ? <CircularProgress size={24} /> : t('verifyNow')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
