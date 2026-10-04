import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, delay = 0 }) {
  const isUp = trend === 'up';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card sx={{ height: '100%', background: 'linear-gradient(145deg,rgba(30,41,59,.98),rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)', borderRadius: 4, position: 'relative', overflow: 'hidden', transition: 'transform .2s ease, border-color .2s ease', '&:hover': { transform: 'translateY(-3px)', borderColor: 'rgba(45,212,191,.35)' } }}>
        {/* Background glow */}
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: gradient || 'linear-gradient(135deg,#14b8a6,#0ea5e9)', opacity: 0.12, filter: 'blur(20px)' }} />
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, background: gradient || 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon && <Icon sx={{ fontSize: 22, color: '#fff' }} />}
            </Box>
            {trend && (
              <Chip
                size="small"
                icon={isUp ? <TrendingUp sx={{ fontSize: '14px !important' }} /> : <TrendingDown sx={{ fontSize: '14px !important' }} />}
                label={trendValue}
                sx={{ background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isUp ? '#10b981' : '#ef4444', border: 'none', fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{title}</Typography>
          {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
