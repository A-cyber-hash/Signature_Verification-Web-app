import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ScatterChart, Scatter, Legend } from 'recharts';
import StatCard from '@components/common/StatCard';
import { Verified, Security, Speed, Analytics } from '@mui/icons-material';

const weekData = [
  { day: 'Mon', verified: 24, failed: 3, score: 89 },
  { day: 'Tue', verified: 31, failed: 5, score: 91 },
  { day: 'Wed', verified: 28, failed: 2, score: 88 },
  { day: 'Thu', verified: 42, failed: 4, score: 93 },
  { day: 'Fri', verified: 38, failed: 6, score: 87 },
  { day: 'Sat', verified: 18, failed: 1, score: 95 },
  { day: 'Sun', verified: 22, failed: 2, score: 90 },
];

const metricData = [
  { metric: 'Cosine', weight: 30, avgScore: 88 },
  { metric: 'Euclidean', weight: 20, avgScore: 72 },
  { metric: 'SSIM', weight: 20, avgScore: 81 },
  { metric: 'ORB', weight: 15, avgScore: 65 },
  { metric: 'Histogram', weight: 8, avgScore: 78 },
  { metric: 'Stroke Geo', weight: 7, avgScore: 94 },
];

const ttip = { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 } };

export default function AnalyticsPage() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Analytics</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>ML engine performance and verification insights</Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'This Week', value: '203', icon: Verified, gradient: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', trend: 'up', trendValue: '+15%', subtitle: 'Total verifications', delay: 0 },
          { title: 'Avg Match Score', value: '90.4%', icon: Analytics, gradient: 'linear-gradient(135deg,#10b981,#a3e635)', trend: 'up', trendValue: '+2.1%', subtitle: 'Calibrated ensemble', delay: 0.05 },
          { title: 'Fraud Detected', value: '7', icon: Security, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', subtitle: 'This month', delay: 0.1 },
          { title: 'Avg Process Time', value: '0.8s', icon: Speed, gradient: 'linear-gradient(135deg,#f7971e,#ffd200)', trend: 'down', trendValue: '-0.2s', subtitle: 'Per verification', delay: 0.15 },
        ].map((p, i) => <Grid item xs={12} sm={6} lg={3} key={i}><StatCard {...p} /></Grid>)}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Weekly Verification Volume</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Verified vs Failed — Last 7 days</Typography>
              <ResponsiveContainer width="100%" height={240} style={{ marginTop: 16 }}>
                <BarChart data={weekData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip {...ttip} />
                  <Bar dataKey="verified" name="Verified" fill="#14b8a6" radius={[4,4,0,0]} />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4,4,0,0]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Daily Avg Score</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Calibrated ensemble score %</Typography>
              <ResponsiveContainer width="100%" height={240} style={{ marginTop: 16 }}>
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip {...ttip} formatter={v => [`${v}%`]} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>ML Metric Performance</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Weight vs average score per metric</Typography>
              <ResponsiveContainer width="100%" height={220} style={{ marginTop: 16 }}>
                <BarChart data={metricData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="metric" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} width={80} />
                  <Tooltip {...ttip} />
                  <Bar dataKey="weight" name="Weight %" fill="rgba(20,184,166,0.6)" radius={[0,4,4,0]} />
                  <Bar dataKey="avgScore" name="Avg Score %" fill="#10b981" radius={[0,4,4,0]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

const cardSx = { background: 'linear-gradient(145deg,#1e293b,#1a1f2e)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 };
