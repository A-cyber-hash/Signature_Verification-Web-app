import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  TextField,
  CircularProgress,
  LinearProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const cardSx = {
  background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 3,
};

export default function SignatureUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    if (!selectedFile) {
      setError('Please select a signature image');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('name', templateName.trim());
      formData.append('description', description.trim());
      formData.append('signature', selectedFile);

      const res = await api.post('/verification/enroll/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      // Save to localStorage for dashboard update
      const templates = JSON.parse(localStorage.getItem('enrolledTemplates') || '[]');
      templates.unshift({
        id: res.data.id,
        name: res.data.name,
        timestamp: new Date().toISOString(),
        status: 'enrolled',
      });
      localStorage.setItem('enrolledTemplates', JSON.stringify(templates.slice(0, 50)));

      // Trigger dashboard update
      window.dispatchEvent(new Event('templateEnrolled'));

      setSuccess(true);
      toast.success('✅ Signature template enrolled successfully!');

      // Reset form
      setTimeout(() => {
        setTemplateName('');
        setDescription('');
        setSelectedFile(null);
        setPreview(null);
        setSuccess(false);
        setUploadProgress(0);
      }, 2000);
    } catch (e) {
      const errorMsg = e?.response?.data?.error || 'Upload failed. Please try again.';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTemplateName('');
    setDescription('');
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
  };

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
            Enroll Signature Template
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Upload a signature image to create a new template for verification
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} icon={<CheckCircle />}>
              <Typography variant="body2" fontWeight={600}>
                ✅ Template Enrolled Successfully!
              </Typography>
              <Typography variant="caption">
                Your signature template has been saved and is ready for verification.
              </Typography>
            </Alert>
          </motion.div>
        )}

        <Grid container spacing={2.5}>
          {/* Upload Area */}
          <Grid item xs={12} lg={7}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  📤 Upload Signature Image
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: '#0a0e1a',
                    minHeight: 350,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    mb: 2,
                    '&:hover': {
                      borderColor: '#14b8a6',
                      background: 'rgba(20,184,166,0.05)',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {!preview ? (
                    <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                      <CloudUpload sx={{ fontSize: 80, mb: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Click to upload or drag and drop
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        PNG, JPG, JPEG (Max 10MB)
                      </Typography>
                    </Box>
                  ) : (
                    <motion.img
                      src={preview}
                      alt="preview"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 12,
                      }}
                    />
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {preview && (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        fileInputRef.current?.click();
                      }}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#14b8a6',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Change Image
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: '#ef4444',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Form */}
          <Grid item xs={12} lg={5}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  📋 Template Details
                </Typography>

                <TextField
                  fullWidth
                  label="Template Name"
                  placeholder="e.g., My Signature"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: '#14b8a6' },
                      '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description (Optional)"
                  placeholder="Add notes about this signature"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: '#14b8a6' },
                      '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  }}
                />

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {loading && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Uploading...
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#14b8a6', fontWeight: 600 }}>
                        {uploadProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || !templateName.trim() || loading}
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
                    {loading && <CircularProgress size={20} sx={{ color: '#fff' }} />}
                    {loading ? 'Uploading...' : '📤 Enroll Template'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleClear}
                    disabled={loading}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#ef4444',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Info */}
          <Grid item xs={12}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  ℹ️ Tips for Best Results
                </Typography>
                <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Use a clear, high-quality image of your signature
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Ensure the signature is well-lit and not blurry
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    The signature should be the main focus of the image
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Supported formats: PNG, JPG, JPEG
                  </Typography>
                  <Typography component="li" variant="body2">
                    Maximum file size: 10MB
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
