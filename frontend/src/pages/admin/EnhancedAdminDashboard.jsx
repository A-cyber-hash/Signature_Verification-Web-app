import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AdminPanelSettings,
  BugReport,
  Download,
  History,
  People,
  PersonAdd,
  PieChart,
  Refresh,
  Search,
  Shield,
  VerifiedUser,
  TrendingUp,
  NewReleases,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import StatCard from '@components/common/StatCard';
import api from '@services/api';

const surfaceSx = { background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)', borderRadius: 3 };
const statusColor = { active: 'success', pending: 'warning', suspended: 'error', inactive: 'default', locked: 'error' };
const initials = (name = '') => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

const COLORS = ['#14b8a6', '#0ea5e9', '#4f46e5', '#f59e0b', '#ef4444'];

export function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadUsers();
    const interval = autoRefresh ? setInterval(loadUsers, 3000) : null;
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users/');
      setUsers(data.results || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const recentUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  }, [users]);

  const metrics = [
    { title: 'Total Users', value: users.length, icon: People, gradient: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', change: `${users.filter(u => u.status === 'active').length} active` },
    { title: 'New This Month', value: users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length, icon: NewReleases, gradient: 'linear-gradient(135deg,#4f46e5,#818cf8)', change: 'This month' },
    { title: 'Pending Approval', value: users.filter(u => u.status === 'pending').length, icon: Warning, gradient: 'linear-gradient(135deg,#f59e0b,#facc15)', change: 'Requires action' },
    { title: 'Total Verifications', value: users.reduce((sum, u) => sum + (u.monthly_verifications || 0), 0), icon: CheckCircle, gradient: 'linear-gradient(135deg,#10b981,#34d399)', change: 'Last 30 days' },
  ];

  const statusData = useMemo(() => {
    const counts = { active: 0, pending: 0, suspended: 0, inactive: 0 };
    users.forEach(u => counts[u.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [users]);

  const registrationTrend = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter(u => u.created_at.startsWith(dateStr)).length;
      last7Days.push({ date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), registrations: count });
    }
    return last7Days;
  }, [users]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3.5 }}>
        <Box>
          <Typography className="eyebrow">Administrator Workspace</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
            Real-Time Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor users, activity, and system health in real-time.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button 
            variant={autoRefresh ? "contained" : "outlined"} 
            startIcon={<Refresh />} 
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="small"
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadUsers}>
            Refresh Now
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      {/* Metrics */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <StatCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid rgba(148,163,184,.2)' }}>
          <Tab label="Analytics" />
          <Tab label="Recent Registrations" />
          <Tab label="User Management" />
        </Tabs>
      </Box>

      {/* Analytics Tab */}
      {tabValue === 0 && (
        <Grid container spacing={2.5}>
          {/* Registration Trend */}
          <Grid item xs={12} md={6}>
            <Card sx={surfaceSx}>
              <CardContent sx={{ p: 3 }}>
                <Typography fontWeight={800} sx={{ mb: 2 }}>
                  Registration Trend (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={registrationTrend}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,.2)' }} />
                    <Area type="monotone" dataKey="registrations" stroke="#14b8a6" fillOpacity={1} fill="url(#colorReg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Status Distribution */}
          <Grid item xs={12} md={6}>
            <Card sx={surfaceSx}>
              <CardContent sx={{ p: 3 }}>
                <Typography fontWeight={800} sx={{ mb: 2 }}>
                  User Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChartComponent>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Registrations Tab */}
      {tabValue === 1 && (
        <Card sx={surfaceSx}>
          <CardContent sx={{ p: 3 }}>
            <Typography fontWeight={800} sx={{ mb: 2 }}>
              Latest User Registrations
            </Typography>
            {loading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['User', 'Email', 'Status', 'Registered', 'Verifications'].map((label) => (
                        <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800, borderColor: 'rgba(255,255,255,.08)' }}>
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(20,184,166,.18)', color: '#5eead4', fontSize: '.75rem', fontWeight: 800 }}>
                              {initials(user.name)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={800}>{user.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)', color: 'text.secondary' }}>{user.email}</TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                          <Chip size="small" label={user.status} color={statusColor[user.status] || 'default'} />
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)', color: 'text.secondary' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                          {user.monthly_verifications || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Management Tab */}
      {tabValue === 2 && (
        <UserManagementTab users={users} loading={loading} onRefresh={loadUsers} />
      )}
    </Box>
  );
}

function UserManagementTab({ users, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, users, filterStatus]);

  const exportToExcel = () => {
    const data = visibleUsers.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Status': user.status,
      'MFA Enabled': user.mfa_enabled ? 'Yes' : 'No',
      'Monthly Verifications': user.monthly_verifications || 0,
      'Last Activity': new Date(user.last_activity).toLocaleDateString(),
      'Created Date': new Date(user.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    worksheet['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
    XLSX.writeFile(workbook, `SignaSecure_Users_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportDialog(false);
  };

  return (
    <>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or role"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
            <Button variant="contained" startIcon={<Download />} onClick={() => setShowExportDialog(true)}>
              Export Excel
            </Button>
          </Stack>

          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    {['Member', 'Role', 'Status', 'MFA', 'Activity', 'Last Seen'].map((label) => (
                      <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800, borderColor: 'rgba(255,255,255,.08)' }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleUsers.map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(20,184,166,.18)', color: '#5eead4', fontSize: '.75rem', fontWeight: 800 }}>
                            {initials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800}>{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>{user.role}</TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                        <Chip size="small" label={user.status} color={statusColor[user.status] || 'default'} />
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>
                        <Chip size="small" label={user.mfa_enabled ? 'Enabled' : 'Disabled'} color={user.mfa_enabled ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)' }}>{user.monthly_verifications || 0}</TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,.06)', color: 'text.secondary' }}>
                        {new Date(user.last_activity).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export User Data</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Export {visibleUsers.length} user records to Excel format with all details.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Download />} onClick={exportToExcel}>Export</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
