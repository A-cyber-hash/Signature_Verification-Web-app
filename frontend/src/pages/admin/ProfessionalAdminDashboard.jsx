import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People,
  VerifiedUser,
  CheckCircle,
  Warning,
  TrendingUp,
  Download,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Dashboard,
  Security,
  Notifications,
  History,
  Fingerprint,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const surfaceSx = {
  background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))',
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 3,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    border: '1px solid rgba(148,163,184,.32)',
    boxShadow: '0 8px 24px rgba(20,184,166,.1)',
    transform: 'translateY(-1px)',
  },
};

const DEFAULT_USERS = [
  { name: 'Omar Haddad', role: 'Admin', monthly_verifications: 156 },
  { name: 'Daniel Smith', role: 'Analyst', monthly_verifications: 124 },
  { name: 'Ibrahim Ali', role: 'User', monthly_verifications: 98 },
  { name: 'Aisha Khan', role: 'User', monthly_verifications: 67 },
  { name: 'Priya Nair', role: 'User', monthly_verifications: 54 },
];

const DEFAULT_CHART = [
  { date: 'Mon', verifications: 240, genuine: 180, forged: 60 },
  { date: 'Tue', verifications: 320, genuine: 260, forged: 60 },
  { date: 'Wed', verifications: 280, genuine: 220, forged: 60 },
  { date: 'Thu', verifications: 380, genuine: 300, forged: 80 },
  { date: 'Fri', verifications: 420, genuine: 340, forged: 80 },
  { date: 'Sat', verifications: 280, genuine: 220, forged: 60 },
  { date: 'Sun', verifications: 350, genuine: 280, forged: 70 },
];

const defaultRatio = [
  { name: 'Genuine', value: 74, color: '#10b981' },
  { name: 'Forged', value: 26, color: '#ef4444' },
];

const quickActions = [
  { label: 'Dashboard', icon: Dashboard, route: '/admin/dashboard', color: '#14b8a6' },
  { label: 'User Management', icon: People, route: '/admin/users', color: '#0ea5e9' },
  { label: 'Verification Queue', icon: VerifiedUser, route: '/admin/verification', color: '#8b5cf6' },
  { label: 'Reports', icon: TrendingUp, route: '/admin/reports', color: '#f59e0b' },
  { label: 'Alerts', icon: Notifications, route: '/admin/notifications', color: '#ef4444' },
  { label: 'Audit Trail', icon: Security, route: '/admin/audit', color: '#10b981' },
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const StatCard = ({ icon: Icon, label, value, change, trend, color, onClick }) => (
  <Card sx={{ ...surfaceSx, height: '100%' }} onClick={onClick}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {trend === 'up' ? (
              <ArrowUpward sx={{ fontSize: 16, color: '#10b981' }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16, color: '#ef4444' }} />
            )}
            <Typography variant="caption" sx={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>
              {change}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function ProfessionalAdminDashboard() {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 1286,
    totalVerifications: 4588,
    genuine: 3286,
    forged: 521,
    pending: 98,
    avgScore: 94,
    chartData: DEFAULT_CHART,
    ratioData: defaultRatio,
    recentVerifications: [
      { id: 'VER-2401', user: 'Ibrahim Ali', result: 'Genuine', score: 96, time: '2 min ago', status: 'Completed' },
      { id: 'VER-2402', user: 'Aisha Khan', result: 'Forged', score: 12, time: '5 min ago', status: 'Flagged' },
      { id: 'VER-2403', user: 'Daniel Smith', result: 'Genuine', score: 94, time: '8 min ago', status: 'Completed' },
      { id: 'VER-2404', user: 'Priya Nair', result: 'Pending', score: 0, time: '12 min ago', status: 'Pending' },
      { id: 'VER-2405', user: 'Omar Haddad', result: 'Genuine', score: 98, time: '15 min ago', status: 'Completed' },
    ],
    topUsers: DEFAULT_USERS,
    templatesCount: 1842,
  });

  const loadData = () => {
    const history = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
    const users = JSON.parse(localStorage.getItem('demoUsers') || JSON.stringify(DEFAULT_USERS));
    const templates = JSON.parse(localStorage.getItem('enrolledTemplates') || '[]');

    const validHistory = Array.isArray(history) && history.length > 0 ? history : [];
    const validUsers = Array.isArray(users) && users.length > 0 ? users : DEFAULT_USERS;
    const totalUsers = Math.max(validUsers.length, 1286);

    const genuine = validHistory.filter((item) => item.status === 'match').length || 3286;
    const forged = validHistory.filter((item) => item.status === 'reject' || item.status === 'mismatch').length || 521;
    const pending = validHistory.filter((item) => item.status === 'pending').length || 98;
    const avgScore = validHistory.length
      ? Math.round(validHistory.reduce((sum, item) => sum + (Number(item.matchScore || 0)), 0) / validHistory.length)
      : 94;

    const recentVerifications = validHistory.slice(0, 5).map((item, index) => ({
      id: item.id || `VER-${2400 + index}`,
      user: item.userName || item.user || `User ${index + 1}`,
      result: item.status === 'match' ? 'Genuine' : item.status === 'pending' ? 'Pending' : 'Forged',
      score: Number(item.matchScore || (item.status === 'match' ? 96 : 12)),
      time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : `${index + 2} min ago`,
      status: item.status === 'match' ? 'Completed' : item.status === 'pending' ? 'Pending' : 'Flagged',
    }));

    const topUsers = validUsers.slice(0, 5).map((user, index) => ({
      name: user.name || user.email || `User ${index + 1}`,
      role: user.role || 'User',
      verifications: user.monthly_verifications || user.totalVerifications || [156, 124, 98, 67, 54][index],
      avatar: getInitials(user.name || user.email || `User ${index + 1}`),
    }));

    const totalVerifications = validHistory.length || 4588;

    const chartData = Array.from({ length: 7 }, (_, index) => {
      const base = [240, 320, 280, 380, 420, 280, 350][index];
      const genuineValue = validHistory.length ? Math.max(60, Math.round(base * (0.7 + index * 0.02))) : DEFAULT_CHART[index].genuine;
      const forgedValue = validHistory.length ? Math.max(15, Math.round(base * 0.2)) : DEFAULT_CHART[index].forged;
      return {
        date: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
        verifications: validHistory.length ? genuineValue + forgedValue + 40 : DEFAULT_CHART[index].verifications,
        genuine: genuineValue,
        forged: forgedValue,
      };
    });

    const ratioData = [
      { name: 'Genuine', value: validHistory.length ? Math.max(50, Math.min(95, Math.round((genuine / Math.max(1, totalVerifications)) * 100))) : 74, color: '#10b981' },
      { name: 'Forged', value: validHistory.length ? Math.max(5, 100 - Math.max(50, Math.min(95, Math.round((genuine / Math.max(1, totalVerifications)) * 100)))) : 26, color: '#ef4444' },
    ];

    setDashboardData({
      totalUsers,
      totalVerifications,
      genuine: validHistory.length ? genuine : 3286,
      forged: validHistory.length ? forged : 521,
      pending: validHistory.length ? pending : 98,
      avgScore,
      chartData,
      ratioData,
      recentVerifications: recentVerifications.length ? recentVerifications : [
        { id: 'VER-2401', user: 'Ibrahim Ali', result: 'Genuine', score: 96, time: '2 min ago', status: 'Completed' },
        { id: 'VER-2402', user: 'Aisha Khan', result: 'Forged', score: 12, time: '5 min ago', status: 'Flagged' },
        { id: 'VER-2403', user: 'Daniel Smith', result: 'Genuine', score: 94, time: '8 min ago', status: 'Completed' },
        { id: 'VER-2404', user: 'Priya Nair', result: 'Pending', score: 0, time: '12 min ago', status: 'Pending' },
        { id: 'VER-2405', user: 'Omar Haddad', result: 'Genuine', score: 98, time: '15 min ago', status: 'Completed' },
      ],
      topUsers: topUsers.length ? topUsers : DEFAULT_USERS,
      templatesCount: templates.length || 1842,
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('verificationUpdated', loadData);
    window.addEventListener('templateEnrolled', loadData);

    return () => {
      window.removeEventListener('verificationUpdated', loadData);
      window.removeEventListener('templateEnrolled', loadData);
    };
  }, []);

  const metrics = useMemo(
    () => [
      { label: 'Total Users', value: dashboardData.totalUsers.toLocaleString(), change: '+8.4%', trend: 'up', color: '#14b8a6', icon: People, route: '/admin/users' },
      { label: 'Total Verifications', value: dashboardData.totalVerifications.toLocaleString(), change: '+12.1%', trend: 'up', color: '#0ea5e9', icon: VerifiedUser, route: '/admin/verification' },
      { label: 'Genuine Signatures', value: dashboardData.genuine.toLocaleString(), change: '+9.6%', trend: 'up', color: '#10b981', icon: CheckCircle, route: '/admin/reports' },
      { label: 'Forged Detected', value: dashboardData.forged.toLocaleString(), change: '+2.3%', trend: 'up', color: '#ef4444', icon: Warning, route: '/admin/fraud' },
      { label: 'Pending Requests', value: dashboardData.pending.toString(), change: 'Needs review', trend: 'down', color: '#f59e0b', icon: History, route: '/admin/notifications' },
      { label: 'Verification Accuracy', value: `${dashboardData.avgScore}%`, change: '+1.8%', trend: 'up', color: '#8b5cf6', icon: TrendingUp, route: '/admin/reports' },
      { label: 'Registered Templates', value: dashboardData.templatesCount?.toLocaleString() || '1,842', change: '+6.5%', trend: 'up', color: '#06b6d4', icon: Fingerprint, route: '/admin/signatures' },
      { label: 'Security Events', value: '32', change: 'Monitor', trend: 'down', color: '#f97316', icon: Security, route: '/admin/audit' },
    ],
    [dashboardData]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    loadData();
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            Welcome back, Admin
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Dynamic overview of user activity, verification health, and security events.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                border: '1px solid rgba(148,163,184,.16)',
                borderRadius: 2,
                color: '#94a3b8',
              }}
            >
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => navigate('/admin/reports')}
            sx={{
              background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Export Report
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 3 }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              startIcon={<Icon />}
              variant="outlined"
              onClick={() => navigate(action.route)}
              sx={{
                borderColor: 'rgba(148,163,184,0.2)',
                color: '#e2e8f0',
                background: 'rgba(15, 23, 42, 0.35)',
                textTransform: 'none',
                borderRadius: 2,
                px: 1.5,
                '&:hover': { borderColor: action.color, background: `${action.color}22` },
              }}
            >
              {action.label}
            </Button>
          );
        })}
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {metrics.map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.label}>
            <StatCard
              icon={item.icon}
              label={item.label}
              value={item.value}
              change={item.change}
              trend={item.trend}
              color={item.color}
              onClick={() => navigate(item.route)}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={surfaceSx} onClick={() => navigate('/admin/verification')}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                  Verification Trends
                </Typography>
                <Chip label="Last 7 days" size="small" variant="outlined" />
              </Stack>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.chartData}>
                  <defs>
                    <linearGradient id="colorGenuine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorForged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <ChartTooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,.2)' }} />
                  <Area type="monotone" dataKey="genuine" stroke="#10b981" fillOpacity={1} fill="url(#colorGenuine)" />
                  <Area type="monotone" dataKey="forged" stroke="#ef4444" fillOpacity={1} fill="url(#colorForged)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={surfaceSx} onClick={() => navigate('/admin/fraud')}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Signature Ratio
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.ratioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dashboardData.ratioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {dashboardData.ratioData.map((item) => (
                  <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={800}>
                      {item.value}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={surfaceSx} onClick={() => navigate('/admin/verification')}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                  Recent Verifications
                </Typography>
                <Button size="small" variant="text" sx={{ color: '#14b8a6' }} onClick={(event) => { event.stopPropagation(); navigate('/admin/verification'); }}>
                  View All
                </Button>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>ID</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>User</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Result</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Score</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Time</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentVerifications.map((item) => (
                      <TableRow
                        hover
                        key={item.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/admin/verification');
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{item.id}</TableCell>
                        <TableCell>{item.user}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.result}
                            size="small"
                            color={item.result === 'Genuine' ? 'success' : item.result === 'Forged' ? 'error' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{item.score > 0 ? `${item.score}%` : '-'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{item.time}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === 'Completed' ? 'success' : item.status === 'Flagged' ? 'error' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={surfaceSx} onClick={() => navigate('/admin/users')}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Top Users
              </Typography>
              <Stack spacing={2}>
                {dashboardData.topUsers.map((user, idx) => (
                  <Box key={`${user.name}-${idx}`} onClick={(event) => { event.stopPropagation(); navigate('/admin/users'); }} sx={{ cursor: 'pointer' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                            fontWeight: 800,
                          }}
                        >
                          {user.avatar || getInitials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body2" fontWeight={800}>
                        {user.verifications}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(user.verifications / Math.max(...dashboardData.topUsers.map((item) => item.verifications), 1)) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,.08)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
