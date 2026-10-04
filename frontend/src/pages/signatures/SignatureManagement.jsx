import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  LinearProgress, Avatar, IconButton, Tooltip, Alert,
} from '@mui/material';
import { Add, Fingerprint, Verified, BarChart, Delete, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { verificationAPI } from '@services/api';
import toast from 'react-hot-toast';

export default function SignatureManagement() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationAPI.getTemplates()
      .then(r => setTemplates(r.data.templates || []))
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Signatures</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{templates.length} enrolled template{templates.length !== 1 ? 's' : ''}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/signatures/upload')}
          sx={{ background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', borderRadius: 2 }}>
          Enroll New
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />}

      {!loading && templates.length === 0 && (
        <Card sx={cardSx}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Fingerprint sx={{ fontSize: 72, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No signatures enrolled</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Enroll your first signature to start verifying</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/signatures/upload')}
              sx={{ background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)' }}>
              Enroll First Signature
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2.5}>
        {templates.map((t, i) => {
          const successRate = Math.round(t.success_rate || 0);
          const avgScore   = Math.round(t.avg_similarity_score || 0);
          return (
            <Grid item xs={12} sm={6} lg={4} key={t.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card sx={{ ...cardSx, '&:hover': { borderColor: 'rgba(20,184,166,0.3)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Avatar sx={{ background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', width: 44, height: 44, fontWeight: 700 }}>
                        {t.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body1" fontWeight={700} noWrap>{t.name}</Typography>
                        <Chip label={t.quality_level || 'active'} size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'none', fontSize: '0.65rem', height: 18 }} />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                        <Typography variant="h6" fontWeight={700}>{t.verification_count || 0}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Verifications</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#10b981' }}>{successRate}%</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Success Rate</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center', p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#14b8a6' }}>{avgScore}%</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Avg Score</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Success Rate</Typography>
                        <Typography variant="caption" fontWeight={600}>{successRate}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={successRate}
                        sx={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#14b8a6,#0ea5e9)', borderRadius: 3 } }} />
                    </Box>

                    <Button fullWidth variant="outlined" size="small" endIcon={<ArrowForward />}
                      onClick={() => navigate('/verification', { state: { templateId: t.id } })}
                      sx={{ mt: 1.5, borderColor: 'rgba(255,255,255,0.1)', color: '#14b8a6', borderRadius: 2, '&:hover': { borderColor: '#14b8a6', background: 'rgba(20,184,166,0.08)' } }}>
                      Verify Against This
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

const cardSx = { background: 'linear-gradient(145deg,#1e293b,#1a1f2e)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 };
