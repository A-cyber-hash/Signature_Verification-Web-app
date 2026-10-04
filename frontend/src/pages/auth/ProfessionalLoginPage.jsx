import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { loginUser, clearError } from '../../store/slices/authSlice';

export default function ProfessionalLoginPage({ isAdmin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [email, setEmail] = useState(isAdmin ? 'admin@example.com' : 'user@example.com');
  const [password, setPassword] = useState(isAdmin ? 'Admin@123' : 'User@123');

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = isAdmin ? '/admin/dashboard' : '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Email is required');
      return;
    }

    if (!password) {
      alert('Password is required');
      return;
    }

    dispatch(clearError());

    const result = await dispatch(
      loginUser({
        email: email.trim(),
        password: password.trim(),
        isAdmin,
      })
    );

    if (result.meta.requestStatus === 'fulfilled' && result.payload?.user) {
      const targetRoute = ['admin', 'super_admin'].includes(result.payload.user.role_type)
        ? '/admin/dashboard'
        : '/dashboard';
      navigate(targetRoute, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
            border: '1px solid rgba(148,163,184,.16)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, color: '#f1f5f9', fontWeight: 800 }}>
              {isAdmin ? 'Admin Login' : 'User Login'}
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: '#94a3b8' }}>
              {isAdmin
                ? 'Sign in to manage users and access admin features'
                : 'Sign in to verify signatures and access your workspace'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: 'rgba(148,163,184,.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(20,184,166,.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#14b8a6' },
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': { borderColor: 'rgba(148,163,184,.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(20,184,166,.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#14b8a6' },
                }}
                disabled={loading}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                  color: '#062b35',
                  fontWeight: 800,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
                  },
                  '&:disabled': {
                    background: 'rgba(20,184,166,.3)',
                    color: 'rgba(6,43,53,.5)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </form>

            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/auth')}
                sx={{ color: '#14b8a6' }}
              >
                Back to Portals
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}