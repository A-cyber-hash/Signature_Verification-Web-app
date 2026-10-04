import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Typography, Button, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon, Chip, Avatar, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Verified, Cancel, Fingerprint, Add, CameraAlt, Analytics,
  TrendingUp, Security, CheckCircle, Schedule, ArrowForward,
  CompareArrows, Refresh, CloudUpload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@components/common/StatCard';
import api from '@services/api';

const COLORS = ['#14b8a6', '#10b981', '#f59e0b', '#ef4444'];

const areaData = [
  { day: 'Mon', verified: 24, failed: 3 },
  { day: 'Tue', verified: 31, failed: 5 },
  { day: 'Wed', verified: 28, failed: 2 },
  { day: 'Thu', verified: 42, failed: 4 },
  { day: 'Fri', verified: 38, failed: 6 },
  { day: 'Sat', verified: 18, failed: 1 },
  { day: 'Sun', verified: 22, failed: 2 },
];

const pieData = [
  { name: 'Cosine', value: 30 },
  { name: 'SSIM', value: 20 },
  { name: 'ORB', value: 15 },
  { name: 'Other', value: 35 },
];

const QUICK_ACTIONS = [
  { label: 'Verify Signature', icon: CameraAlt, path: '/verification', gradient: 'linear-gradient(135deg,#14b8a6,#0ea5e9)' },
  { label: 'Enroll Template', icon: CloudUpload, path: '/signatures/upload', gradient: 'linear-gradient(135deg,#10b981,#a3e635)' },
  { label: 'View Analytics', icon: Analytics, path: '/analytics', gradient: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { label: 'My Signatures', icon: Fingerprint, path: '/signatures/manage', gradient: 'linear-gradient(135deg,#f953c6,#b91d73)' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState({
    totalVerifications: 0,
    totalMatches: 0,
    enrolledTemplates: 0,
    avgScore: 0,
  });

  useEffect(() => {
    loadData();
    
    window.addEventListener('verificationUpdated', loadData);
    window.addEventListener('templateEnrolled', loadData);
    
    return () => {
      window.removeEventListener('verificationUpdated', loadData);
      window.removeEventListener('templateEnrolled', loadData);
    };
  }, []);

  const loadData = async () => {
    try {
      const verHistory = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
      const enrollHistory = JSON.parse(localStorage.getItem('enrolledTemplates') || '[]');
      
      setVerificationHistory(verHistory.slice(0, 10));
      setEnrollmentHistory(enrollHistory.slice(0, 10));
      
      const res = await api.get('/verification/templates/');
      const templatesData = res.data.templates || [];
      setTemplates(templatesData);
      
      const totalVer = verHistory.length;
      const totalMatch = verHistory.filter(v => v.status === 'match').length;
      const avgSc = verHistory.length > 0
        ? Math.round(verHistory.reduce((sum, v) => sum + (v.matchScore || 0), 0) / verHistory.length)
        : 0;
      
      setStats({
        totalVerifications: totalVer,
        totalMatches: totalMatch,
        enrolledTemplates: templatesData.length,
        avgScore: avgSc,
      });
      
      setLoading(false);
    } catch (e) {
      console.error('Failed to load data:', e);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(14,165,233,0.08))', borderRadius: 3, border: '1px solid rgba(20,184,166,0.15)' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ flex: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5 }}>
              Welcome back, {user?.first_name || 'User'} 👋
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 500 }}>
              Here's your signature verification overview for today.
            </Typography>
          </Box>
        </motion.div>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ 
            color: '#14b8a6', 
            textTransform: 'none',
            background: 'rgba(20,184,166,0.1)',
            border: '1px solid rgba(20,184,166,0.3)',
            borderRadius: 2,
            px: 2,
            '&:hover': {
              background: 'rgba(20,184,166,0.15)',
              borderColor: 'rgba(20,184,166,0.5)',
            }
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div key={`stat-${stats.totalVerifications}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <StatCard 
              title="Total Verifications" 
              value={stats.totalVerifications} 
              icon={Verified} 
              gradient="linear-gradient(135deg,#14b8a6,#0ea5e9)" 
              trend="up" 
              trendValue="+12%" 
              subtitle="All time" 
              delay={0} 
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div key={`stat-${stats.totalMatches}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <StatCard 
              title="Successful Matches" 
              value={stats.totalMatches} 
              icon={CheckCircle} 
              gradient="linear-gradient(135deg,#10b981,#a3e635)" 
              trend="up" 
              trendValue="+8%" 
              subtitle="Above 85% threshold" 
              delay={0.05} 
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div key={`stat-${stats.enrolledTemplates}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <StatCard 
              title="Enrolled Templates" 
              value={stats.enrolledTemplates} 
              icon={Fingerprint} 
              gradient="linear-gradient(135deg,#f7971e,#ffd200)" 
              subtitle="Active signatures" 
              delay={0.1} 
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <motion.div key={`stat-${stats.avgScore}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <StatCard 
              title="Avg Match Score" 
              value={`${stats.avgScore}%`} 
              icon={TrendingUp} 
              gradient="linear-gradient(135deg,#f953c6,#b91d73)" 
              subtitle="Across all verifications" 
              delay={0.15} 
            />
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Verification Trend</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last 7 days</Typography>
                </Box>
                <Chip label="Live" size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem' }} />
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="gVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="verified" stroke="#14b8a6" fill="url(#gVerified)" strokeWidth={2} name="Verified" />
                  <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="url(#gFailed)" strokeWidth={2} name="Failed" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>ML Metric Weights</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ensemble composition</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <PieChart width={180} height={180}>
                  <Pie data={pieData} cx={85} cy={85} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {pieData.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{d.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={1.5}>
                {QUICK_ACTIONS.map(({ label, icon: Icon, path, gradient }) => (
                  <Grid item xs={6} key={label}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Box
                        onClick={() => navigate(path)}
                        sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'center', '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(20,184,166,0.3)' }, transition: 'all 0.2s' }}
                      >
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                          <Icon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Typography variant="caption" fontWeight={600} sx={{ lineHeight: 1.3, display: 'block' }}>{label}</Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Enrolled Signatures</Typography>
                <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => navigate('/signatures/manage')} sx={{ color: '#14b8a6', textTransform: 'none', fontSize: '0.75rem' }}>
                  View All
                </Button>
              </Box>
              {loading ? (
                <LinearProgress sx={{ borderRadius: 2 }} />
              ) : templates.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Fingerprint sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>No signatures enrolled yet</Typography>
                  <Button variant="contained" size="small" startIcon={<CloudUpload />} onClick={() => navigate('/signatures/upload')} sx={{ background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)' }}>
                    Enroll First Signature
                  </Button>
                </Box>
              ) : (
                <List disablePadding>
                  {templates.slice(0, 5).map((t, i) => (
                    <React.Fragment key={t.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', fontSize: '0.75rem' }}>
                            {t.name?.[0]}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={t.name}
                          secondary={`${t.verification_count || 0} verifications • ${Math.round(t.success_rate || 0)}% success`}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>{Math.round(t.avg_similarity_score || 0)}%</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>avg score</Typography>
                        </Box>
                      </ListItem>
                      {i < templates.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Latest verifications and enrollments</Typography>
                </Box>
                <Chip label="Live Updates" size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem' }} />
              </Box>

              {verificationHistory.length === 0 && enrollmentHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CompareArrows sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No activity yet</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Activity</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Details</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {verificationHistory.map((item, idx) => (
                        <TableRow key={`ver-${idx}`} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.type === 'compare' ? <CompareArrows sx={{ fontSize: 16, color: '#14b8a6' }} /> : <Verified sx={{ fontSize: 16, color: '#14b8a6' }} />}
                              {item.type === 'compare' ? 'Comparison' : 'Verification'}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600 }}>
                            {item.matchScore}% match
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Chip
                              label={item.status === 'match' ? 'Matched' : 'Not Matched'}
                              size="small"
                              sx={{
                                background: item.status === 'match' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                color: item.status === 'match' ? '#10b981' : '#ef4444',
                                fontSize: '0.65rem',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}

                      {enrollmentHistory.map((item, idx) => (
                        <TableRow key={`enr-${idx}`} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CloudUpload sx={{ fontSize: 16, color: '#10b981' }} />
                              Template Enrolled
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {item.name}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Chip
                              label="Enrolled"
                              size="small"
                              sx={{
                                background: 'rgba(16,185,129,0.15)',
                                color: '#10b981',
                                fontSize: '0.65rem',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ ...cardSx, background: 'linear-gradient(135deg,rgba(20,184,166,0.1),rgba(14,165,233,0.1))', border: '1px solid rgba(20,184,166,0.2)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Security sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>ML Engine Status</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>7-group feature extraction • 6-metric ensemble • Sigmoid calibration</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['HOG','LBP','Hu Moments','ORB','SSIM','Stroke Geo'].map(m => (
                    <Chip key={m} label={m} size="small" sx={{ background: 'rgba(20,184,166,0.15)', color: '#a5b4fc', fontSize: '0.7rem', border: '1px solid rgba(20,184,166,0.2)' }} />
                  ))}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>● Active</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Threshold: 85%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

const cardSx = {
  background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 3,
};
