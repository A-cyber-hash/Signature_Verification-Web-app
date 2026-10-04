import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Shield } from '@mui/icons-material';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <Box sx={{ minHeight: '100vh', background: '#0f1419', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <Box sx={{ width: 64, height: 64, borderRadius: 3, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield sx={{ fontSize: 36, color: '#fff' }} />
        </Box>
      </motion.div>
      <CircularProgress size={28} sx={{ color: '#14b8a6' }} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading SignaSecure...</Typography>
    </Box>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', background: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>Something went wrong</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Please refresh the page and try again.</Typography>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default LoadingScreen;
