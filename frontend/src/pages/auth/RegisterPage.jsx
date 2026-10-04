import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  PersonAdd,
  ArrowForward,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#F8FAFC',
    borderRadius: 2.5,
    backgroundColor: '#0F1722',
    '& fieldset': { borderColor: '#334155' },
    '&:hover fieldset': { borderColor: '#2DD4BF' },
    '&.Mui-focused fieldset': { borderColor: '#2DD4BF' },
  },
  '& .MuiInputLabel-root': { color: '#AAB8C7' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2DD4BF' },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (fieldErrors[k]) {
      setFieldErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.first_name.trim()) errors.first_name = 'First name is required';
    if (!form.last_name.trim()) errors.last_name = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.password) errors.password = 'Password is required';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const register = async () => {
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (res.data?.tokens?.access) {
        localStorage.setItem('signasecure_token', res.data.tokens.access);
        localStorage.setItem('signasecure_refresh', res.data.tokens.refresh);
        toast.success('✅ Account created successfully!');
        navigate('/dashboard');
      } else {
        setError('Registration successful but token not received. Please login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (e) {
      let errorMsg = 'Registration failed. Please try again.';

      if (e.message?.includes('Network Error') || e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK') {
        errorMsg = 'We cannot reach the secure signup service right now. Please try again in a moment.';
      } else if (e.response?.status >= 500) {
        errorMsg = 'We could not create your workspace right now. Please try again in a moment.';
      } else if (e?.response?.data?.error) {
        errorMsg = e.response.data.error;
      } else if (e?.message) {
        errorMsg = e.message;
      }

      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
      console.error('Registration error:', e);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = form.password
    ? Math.min(100, form.password.length * 12.5)
    : 0;

  const isFormValid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.email.trim() &&
    form.password &&
    form.password === form.confirmPassword &&
    form.password.length >= 8;

  return (
    <AuthLayout
      eyebrow="CREATE YOUR WORKSPACE"
      title="Every important signature deserves certainty."
      description="Set up your secure workspace in a few moments, then bring confidence to every decision that follows."
    >
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Card
          sx={{
            width: '100%',
            background: '#111827',
            backgroundImage: 'none',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,.09)',
            borderRadius: 5,
            boxShadow: '0 28px 70px rgba(0,0,0,.36)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  background: 'rgba(45,212,191,.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <PersonAdd sx={{ color: '#2DD4BF', fontSize: 26 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} letterSpacing="-.03em">Create your workspace</Typography>
              <Typography variant="body2" sx={{ color: '#AAB8C7', mt: 0.5 }}>Start verifying with confidence.</Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                onClose={() => setError('')}
                icon={<ErrorIcon />}
              >
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={form.first_name}
                  onChange={e => update('first_name', e.target.value)}
                  error={!!fieldErrors.first_name}
                  helperText={fieldErrors.first_name}
                  sx={inputSx}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={form.last_name}
                  onChange={e => update('last_name', e.target.value)}
                  error={!!fieldErrors.last_name}
                  helperText={fieldErrors.last_name}
                  sx={inputSx}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  sx={inputSx}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone (Optional)"
                  placeholder="+91..."
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  sx={inputSx}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password || 'Min 8 characters'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 0, p: 0.5, color: '#14b8a6' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                  disabled={loading}
                />
                {form.password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#AAB8C7' }}>
                        Password Strength
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            passwordStrength < 50
                              ? '#ef4444'
                              : passwordStrength < 75
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      >
                        {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        background: '#334155',
                        '& .MuiLinearProgress-bar': {
                          background:
                            passwordStrength < 50
                              ? '#ef4444'
                              : passwordStrength < 75
                              ? '#f59e0b'
                              : '#10b981',
                        },
                      }}
                    />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  InputProps={{
                    endAdornment: form.confirmPassword && (
                      <InputAdornment position="end">
                        {form.password === form.confirmPassword ? (
                          <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                        ) : (
                          <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
                  onClick={register}
                  disabled={loading || !isFormValid}
                  sx={{
                    py: 1.4,
                    background: '#1BAD91',
                    color: '#062B35',
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { background: '#56D6BF', boxShadow: '0 10px 22px rgba(30,174,145,.22)' },
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>

            <Typography
              variant="body2"
              sx={{ color: '#AAB8C7', textAlign: 'center', mt: 2 }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2DD4BF', textDecoration: 'none', fontWeight: 800 }}>
                Sign in
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
