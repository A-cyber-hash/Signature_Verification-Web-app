import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  VerifiedUser,
  CheckCircle,
  Warning,
  Clock,
  TrendingUp,
  Block,
  Image,
  ArrowRight,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <Card sx={{
    background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
    border: '1px solid rgba(148,163,184,.16)',
    borderRadius: 3,
    transition: 'all 0.3s',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,.3)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: change?.includes('-') ? '#ef4444' : '#10b981' }}>
            {change}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Icon />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentVerifications, setRecentVerifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, verificationsRes] = await Promise.all([
        api.get('/admin/dashboard/stats/'),
        api.get('/admin/verifications/?limit=5'),
      ]);
      setStats(statsRes.data);
      setRecentVerifications(verificationsRes.data.results || []);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartData = [
    { name: 'Mon', verifications: 45, genuine: 38, forged: 7 },
    { name: 'Tue', verifications: 52, genuine: 44, forged: 8 },
    { name: 'Wed', verifications: 48, genuine: 41, forged: 7 },
    { name: 'Thu', verifications: 61, genuine: 52, forged: 9 },
    { name: 'Fri', verifications: 55, genuine: 47, forged: 8 },
    { name: 'Sat', verifications: 42, genuine: 36, forged: 6 },
    { name: 'Sun', verifications: 38, genuine: 32, forged: 6 },
  ];

  const pieData = [
    { name: 'Genuine', value: stats?.genuine_count || 0, color: '#10b981' },
    { name: 'Forged', value: stats?.forged_count || 0, color: '#ef4444' },
  ];

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome back! Here's your system overview.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={People}
            label="Total Users"
            value={stats?.total_users || 0}
            change="+12 this month"
            color="#14b8a6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={VerifiedUser}
            label="Total Verifications"
            value={stats?.total_verifications || 0}
            change="+8% from last week"
            color="#0ea5e9"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={CheckCircle}
            label="Genuine Signatures"
            value={stats?.genuine_count || 0}
            change={`${stats?.accuracy || 0}% accuracy`}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={Warning}
            label="Forged Signatures"
            value={stats?.forged_count || 0}
            change="-2% from last week"
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={Clock}
            label="Pending Requests"
            value={stats?.pending_count || 0}
            change="Awaiting review"
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={TrendingUp}
            label="Verification Accuracy"
            value={`${stats?.accuracy || 0}%`}
            change="Model performance"
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={Block}
            label="Blocked Users"
            value={stats?.blocked_users || 0}
            change="Active blocks"
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            icon={Image}
            label="Registered Signatures"
            value={stats?.total_signatures || 0}
            change="In database"
            color="#14b8a6"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Daily Activity */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
            border: '1px solid rgba(148,163,184,.16)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Daily Verification Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,.2)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="verifications" stroke="#14b8a6" strokeWidth={2} />
                  <Line type="monotone" dataKey="genuine" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="forged" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Genuine vs Forged */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{
            background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
            border: '1px solid rgba(148,163,184,.16)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Genuine vs Forged
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card sx={{
            background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
            border: '1px solid rgba(148,163,184,.16)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" startIcon={<People />} sx={{ bgcolor: '#14b8a6', color: '#062b35' }}>
                  Add User
                </Button>
                <Button variant="outlined" startIcon={<People />}>
                  View Users
                </Button>
                <Button variant="outlined" startIcon={<VerifiedUser />}>
                  View Verifications
                </Button>
                <Button variant="outlined" startIcon={<ArrowRight />}>
                  Generate Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{
        background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Recent Verification Activity
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Verification ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>User Name</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Result</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Confidence</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Date & Time</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentVerifications.map((verification) => (
                  <TableRow hover key={verification.id}>
                    <TableCell sx={{ color: '#f1f5f9' }}>{verification.id?.slice(0, 8)}</TableCell>
                    <TableCell sx={{ color: '#f1f5f9' }}>{verification.user_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={verification.result}
                        color={verification.result === 'Genuine' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#f1f5f9' }}>{verification.confidence_score?.toFixed(2)}%</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{new Date(verification.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={verification.status}
                        color={verification.status === 'Completed' ? 'success' : 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" sx={{ color: '#14b8a6' }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
