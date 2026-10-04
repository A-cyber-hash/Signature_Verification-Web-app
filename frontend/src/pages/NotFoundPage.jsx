import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', background: '#0f1419', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Typography variant="h1" fontWeight={900} sx={{ fontSize: '8rem', background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</Typography>
      <Typography variant="h5" fontWeight={600}>Page Not Found</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>The page you're looking for doesn't exist.</Typography>
      <Button variant="contained" startIcon={<Home />} onClick={() => navigate('/')} sx={{ mt: 2, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', borderRadius: 2 }}>
        Go Home
      </Button>
    </Box>
  );
}
