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
} from '@mui/material';
import {
  AccountCircle,
  Add,
  AdminPanelSettings,
  Analytics,
  BugReport,
  CalendarToday,
  CheckCircleOutline,
  DeleteOutline,
  Download,
  Edit,
  Email,
  FileDownload,
  Fingerprint,
  History,
  Lock,
  Mail,
  NotificationsNone,
  People,
  PersonAdd,
  Phone,
  PieChart,
  Refresh,
  Search,
  Security,
  Shield,
  TrendingUp,
  VerifiedUser,
  Visibility,
  Warning,
  Block,
  Restore,
  Settings,
  Assessment,
  AddCircleOutline,
} from '@mui/icons-material';
import { BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import { useState, useEffect, useMemo } from 'react';
import StatCard from '@components/common/StatCard';
import api from '@services/api';

const surfaceSx = {
  background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))',
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 3,
};

const statusColor = {
  active: 'success',
  pending: 'warning',
  suspended: 'error',
  inactive: 'default',
  blocked: 'error',
  genuine: 'success',
  forged: 'error',
  verified: 'success',
};

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const COLORS = ['#14b8a6', '#0ea5e9', '#4f46e5', '#f59e0b', '#ef4444'];

const DEMO_USERS = [
  { id: 'USR-1001', name: 'Ibrahim Ali', email: 'ibrahim@signasecure.com', phone: '+971 55 123 4567', status: 'active', role: 'User', totalVerifications: 28, registeredSignatures: 3, genuine: 21, forged: 3, lastLogin: '2026-09-18 09:15', registeredDate: '2025-06-14', mfa_enabled: true, monthly_verifications: 12 },
  { id: 'USR-1002', name: 'Aisha Khan', email: 'aisha@signasecure.com', phone: '+971 50 222 3344', status: 'blocked', role: 'User', totalVerifications: 11, registeredSignatures: 2, genuine: 8, forged: 3, lastLogin: '2026-09-17 18:10', registeredDate: '2025-05-20', mfa_enabled: false, monthly_verifications: 7 },
  { id: 'USR-1003', name: 'Daniel Smith', email: 'daniel@signasecure.com', phone: '+971 58 998 1122', status: 'active', role: 'Analyst', totalVerifications: 46, registeredSignatures: 5, genuine: 36, forged: 7, lastLogin: '2026-09-19 08:40', registeredDate: '2025-02-05', mfa_enabled: true, monthly_verifications: 15 },
  { id: 'USR-1004', name: 'Priya Nair', email: 'priya@signasecure.com', phone: '+971 52 889 7712', status: 'inactive', role: 'User', totalVerifications: 7, registeredSignatures: 1, genuine: 4, forged: 2, lastLogin: '2026-08-26 13:05', registeredDate: '2025-01-11', mfa_enabled: false, monthly_verifications: 4 },
  { id: 'USR-1005', name: 'Omar Haddad', email: 'omar@signasecure.com', phone: '+971 54 321 9876', status: 'active', role: 'Admin', totalVerifications: 62, registeredSignatures: 7, genuine: 48, forged: 10, lastLogin: '2026-09-20 07:48', registeredDate: '2024-11-02', mfa_enabled: true, monthly_verifications: 21 },
];

const DEMO_SIGNATURES = [
  { id: 'SIG-1101', user: 'Ibrahim Ali', type: 'Original / Registered', uploadDate: '2026-09-12', status: 'Verified' },
  { id: 'SIG-1102', user: 'Aisha Khan', type: 'Test / Uploaded', uploadDate: '2026-09-15', status: 'Needs Review' },
  { id: 'SIG-1103', user: 'Daniel Smith', type: 'Original / Registered', uploadDate: '2026-09-17', status: 'Verified' },
  { id: 'SIG-1104', user: 'Priya Nair', type: 'Test / Uploaded', uploadDate: '2026-09-18', status: 'Pending' },
];

const DEMO_VERIFICATIONS = [
  { id: 'VER-201', user: 'Ibrahim Ali', result: 'Genuine', score: 96, date: '2026-09-18 10:40', status: 'Completed' },
  { id: 'VER-202', user: 'Aisha Khan', result: 'Forged', score: 12, date: '2026-09-18 11:15', status: 'Needs Attention' },
  { id: 'VER-203', user: 'Daniel Smith', result: 'Genuine', score: 94, date: '2026-09-19 09:00', status: 'Completed' },
  { id: 'VER-204', user: 'Priya Nair', result: 'Pending', score: 0, date: '2026-09-20 14:50', status: 'Pending' },
];

const DEMO_NOTIFICATIONS = [
  { id: 'NT-01', title: 'New verification request', detail: 'An employee submitted a new signature verification request.', read: false, date: '2026-09-20 07:45' },
  { id: 'NT-02', title: 'Forged signature detected', detail: 'A high-risk forged signature was flagged for review.', read: false, date: '2026-09-19 22:12' },
  { id: 'NT-03', title: 'User registration', detail: 'A new user profile was created and approved.', read: true, date: '2026-09-19 10:30' },
  { id: 'NT-04', title: 'Model update complete', detail: 'The ML verification model was refreshed successfully.', read: true, date: '2026-09-18 16:55' },
];

const DEMO_ACTIVITY = [
  { id: 'ACT-5001', admin: 'Omar Haddad', action: 'User blocked', description: 'Blocked user Aisha Khan for repeated forged attempts.', ip: '10.24.10.44', date: '2026-09-20 07:48' },
  { id: 'ACT-5002', admin: 'Omar Haddad', action: 'Report generated', description: 'Generated daily verification performance report.', ip: '10.24.10.44', date: '2026-09-19 18:30' },
  { id: 'ACT-5003', admin: 'Omar Haddad', action: 'Settings changed', description: 'Updated verification threshold and notification rules.', ip: '10.24.10.44', date: '2026-09-19 15:00' },
];

const verificationSeries = [
  { day: 'Mon', genuine: 24, forged: 5 },
  { day: 'Tue', genuine: 32, forged: 7 },
  { day: 'Wed', genuine: 31, forged: 6 },
  { day: 'Thu', genuine: 38, forged: 8 },
  { day: 'Fri', genuine: 44, forged: 9 },
  { day: 'Sat', genuine: 28, forged: 4 },
  { day: 'Sun', genuine: 35, forged: 6 },
];

const ratioData = [
  { name: 'Genuine', value: 74 },
  { name: 'Forged', value: 26 },
];

const performanceData = [
  { name: 'Precision', value: 92 },
  { name: 'Recall', value: 88 },
  { name: 'F1 Score', value: 90 },
  { name: 'Accuracy', value: 94 },
];

export function AdminDashboardPage() {
  const metrics = [
    { title: 'Total Users', value: '1,286', icon: People, gradient: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', change: '+8.4%' },
    { title: 'Total Verifications', value: '4,588', icon: VerifiedUser, gradient: 'linear-gradient(135deg,#4f46e5,#818cf8)', change: '+12.1%' },
    { title: 'Genuine Signatures', value: '3,286', icon: CheckCircleOutline, gradient: 'linear-gradient(135deg,#10b981,#a3e635)', change: '+9.6%' },
    { title: 'Forged Signatures', value: '521', icon: Warning, gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', change: '+2.3%' },
    { title: 'Pending Requests', value: '98', icon: History, gradient: 'linear-gradient(135deg,#f97316,#ef4444)', change: 'Needs review' },
    { title: 'Verification Accuracy', value: '94.2%', icon: TrendingUp, gradient: 'linear-gradient(135deg,#14b8a6,#34d399)', change: '+1.8%' },
    { title: 'Blocked Users', value: '32', icon: Lock, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', change: 'Security holds' },
    { title: 'Registered Signatures', value: '1,842', icon: Fingerprint, gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', change: '+6.5%' },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography className="eyebrow">Executive overview</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
            Admin dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor signatures, verification quality, risk events, and operational health.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button variant="outlined" startIcon={<AddCircleOutline />}>Add User</Button>
          <Button variant="outlined" startIcon={<People />}>View Users</Button>
          <Button variant="contained" startIcon={<Analytics />}>Generate Report</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <StatCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Daily verification activity
              </Typography>
              <ResponsiveContainer width="100%" height={290}>
                <LineChart data={verificationSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,.2)' }} />
                  <Line type="monotone" dataKey="genuine" stroke="#14b8a6" strokeWidth={3} />
                  <Line type="monotone" dataKey="forged" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Genuine vs forged ratio
              </Typography>
              <ResponsiveContainer width="100%" height={290}>
                <PieChartComponent>
                  <Pie data={ratioData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                    {ratioData.map((entry, index) => (
                      <Cell key={index} fill={index === 0 ? '#14b8a6' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Weekly verification activity
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={verificationSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,.2)' }} />
                  <Bar dataKey="genuine" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="forged" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Model performance
              </Typography>
              <Stack spacing={2}>
                {performanceData.map((item) => (
                  <Box key={item.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" fontWeight={800}>{item.value}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.value} sx={{ height: 8, borderRadius: 8, bgcolor: 'rgba(255,255,255,0.08)' }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Recent verification activity</Typography>
            <Button variant="outlined" size="small" startIcon={<Download />}>Export</Button>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Verification ID', 'User Name', 'Test Signature', 'Result', 'Confidence', 'Date & Time', 'Status', 'Action'].map((label) => (
                    <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_VERIFICATIONS.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>sig_{item.id.toLowerCase()}</TableCell>
                    <TableCell>
                      <Chip size="small" label={item.result} color={statusColor[item.result.toLowerCase()] || 'default'} />
                    </TableCell>
                    <TableCell>{item.score}%</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.date}</TableCell>
                    <TableCell>
                      <Chip size="small" label={item.status} color={item.status === 'Completed' ? 'success' : 'warning'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" color="primary">View</Button>
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

export { default as EnhancedUserManagement } from './EnhancedUserManagement';
export { default as EnhancedVerificationManagement } from './EnhancedVerificationManagement';

export function UserManagement() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/');
        if (data?.results?.length) {
          setUsers(data.results);
        }
      } catch {
        setUsers(DEMO_USERS);
      }
    };
    fetchUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const haystack = `${user.name || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, filterStatus, filterRole]);

  const uniqueRoles = useMemo(() => [...new Set(users.map((u) => u.role).filter(Boolean))], [users]);

  const toggleUserStatus = (userId, nextStatus) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status: nextStatus } : user))
    );
    setSelectedUser(null);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(visibleUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      Status: user.status,
      'Total Verifications': user.totalVerifications || 0,
      'Registered Signatures': user.registeredSignatures || 0,
      'Last Login': user.lastLogin,
      'Registration Date': user.registeredDate,
    })));
    XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
    XLSX.writeFile(workbook, 'User_Report.xlsx');
    setShowExportDialog(false);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography className="eyebrow">Access control</Typography>
          <Typography variant="h4" fontWeight={800}>User management</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage member access, account status, and operational security decisions.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button variant="outlined" startIcon={<Refresh />}>Refresh</Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => setShowExportDialog(true)}>Export</Button>
          <Button variant="contained" startIcon={<PersonAdd />}>Add User</Button>
        </Stack>
      </Stack>

      <Card sx={surfaceSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, or role"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="small" sx={{ minWidth: 170 }}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} size="small" sx={{ minWidth: 170 }}>
              <MenuItem value="all">All Roles</MenuItem>
              {uniqueRoles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
            <Chip icon={<VerifiedUser />} label={`${visibleUsers.length} users`} variant="outlined" color="primary" />
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['User ID', 'Name', 'Email', 'Phone', 'Total Verifications', 'Status', 'Registration Date', 'Last Login', 'Actions'].map((label) => (
                    <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(20,184,166,.15)', color: '#5eead4' }}>
                          {initials(user.name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.totalVerifications}</TableCell>
                    <TableCell>
                      <Chip size="small" label={user.status} color={statusColor[user.status] || 'default'} />
                    </TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<Visibility />} onClick={() => setSelectedUser(user)}>View</Button>
                        <Button size="small" startIcon={<Edit />}>Edit</Button>
                        {user.status === 'blocked' ? (
                          <Button size="small" startIcon={<Restore />} onClick={() => toggleUserStatus(user.id, 'active')}>Unblock</Button>
                        ) : (
                          <Button size="small" startIcon={<Block />} onClick={() => toggleUserStatus(user.id, 'blocked')}>Block</Button>
                        )}
                        <Button size="small" color="error" startIcon={<DeleteOutline />}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedUser?.name || 'User profile'}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ ...surfaceSx, p: 2 }}>
                    <Stack alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 72, height: 72, bgcolor: '#14b8a6' }}>{initials(selectedUser.name)}</Avatar>
                      <Typography variant="h6" fontWeight={800}>{selectedUser.name}</Typography>
                      <Chip label={selectedUser.status} color={statusColor[selectedUser.status] || 'default'} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,.08)' }}><Mail /><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{selectedUser.email}</Typography></Box></Grid>
                    <Grid item xs={12} sm={6}><Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,.08)' }}><Phone /><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{selectedUser.phone}</Typography></Box></Grid>
                    <Grid item xs={12} sm={6}><Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,.08)' }}><CalendarToday /><Typography variant="caption" color="text.secondary">Registration</Typography><Typography>{selectedUser.registeredDate}</Typography></Box></Grid>
                    <Grid item xs={12} sm={6}><Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,.08)' }}><AccessTimeIcon /><Typography variant="caption" color="text.secondary">Last Login</Typography><Typography>{selectedUser.lastLogin}</Typography></Box></Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button variant="contained" startIcon={<Edit />}>Edit User</Button>
                <Button variant="outlined" startIcon={<Block />} onClick={() => toggleUserStatus(selectedUser.id, 'blocked')}>Block User</Button>
                <Button variant="outlined" startIcon={<Restore />} onClick={() => toggleUserStatus(selectedUser.id, 'active')}>Unblock User</Button>
                <Button variant="text" color="error" startIcon={<DeleteOutline />}>Delete User</Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export user list</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Export the currently visible {visibleUsers.length} users to Excel.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<FileDownload />} onClick={exportToExcel}>Export</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export function SignatureManagementPage() {
  return (
    <Box>
      <Typography className="eyebrow">Signature database</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Signature management</Typography>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Signature ID', 'User Name', 'Signature Type', 'Upload Date', 'Status', 'Actions'].map((label) => (
                    <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800 }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_SIGNATURES.map((signature) => (
                  <TableRow hover key={signature.id}>
                    <TableCell>{signature.id}</TableCell>
                    <TableCell>{signature.user}</TableCell>
                    <TableCell>{signature.type}</TableCell>
                    <TableCell>{signature.uploadDate}</TableCell>
                    <TableCell><Chip label={signature.status} size="small" color={signature.status === 'Verified' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" startIcon={<Visibility />}>View</Button>
                        <Button size="small" startIcon={<DeleteOutline />} color="error">Delete</Button>
                      </Stack>
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

export function VerificationManagementPage() {
  return (
    <Box>
      <Typography className="eyebrow">Verification engine</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Verification management</Typography>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Verification ID', 'User Name', 'AI Result', 'Confidence', 'Date & Time', 'Status', 'Actions'].map((label) => (
                    <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800 }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_VERIFICATIONS.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell><Chip label={item.result} color={statusColor[item.result.toLowerCase()] || 'default'} size="small" /></TableCell>
                    <TableCell>{item.score}%</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell><Chip label={item.status} size="small" color={item.status === 'Completed' ? 'success' : 'warning'} /></TableCell>
                    <TableCell><Button size="small" startIcon={<Visibility />}>View Details</Button></TableCell>
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

export function ReportsAnalyticsPage() {
  return (
    <Box>
      <Typography className="eyebrow">Business intelligence</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Reports & analytics</Typography>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          ['Total Verifications', '4,588'],
          ['Genuine Signatures', '3,286'],
          ['Forged Signatures', '521'],
          ['Verification Success Rate', '94.2%'],
          ['Average Confidence', '91.7%'],
          ['Most Active Users', 'Omar / Daniel'],
        ].map(([title, value]) => (
          <Grid item xs={12} sm={6} lg={4} key={title}>
            <Card sx={surfaceSx}><CardContent sx={{ p: 3 }}><Typography color="text.secondary">{title}</Typography><Typography variant="h4" fontWeight={800}>{value}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={surfaceSx}><CardContent sx={{ p: 3 }}><ResponsiveContainer width="100%" height={300}><BarChart data={verificationSeries}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="genuine" fill="#14b8a6" /><Bar dataKey="forged" fill="#ef4444" /></BarChart></ResponsiveContainer></CardContent></Card>
    </Box>
  );
}

export function NotificationsPage() {
  return (
    <Box>
      <Typography className="eyebrow">Communication hub</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Notification center</Typography>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {DEMO_NOTIFICATIONS.map((n) => (
              <Box key={n.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,.08)', background: n.read ? 'rgba(255,255,255,.02)' : 'rgba(20,184,166,.06)' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <NotificationsNone color={n.read ? 'disabled' : 'primary'} />
                  <Box>
                    <Typography fontWeight={700}>{n.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{n.detail}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                  {!n.read && <Chip label="Unread" size="small" color="primary" />}
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export function AdminActivityPage() {
  return (
    <Box>
      <Typography className="eyebrow">Audit & security</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Admin activity</Typography>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Activity ID', 'Admin Name', 'Action', 'Description', 'IP Address', 'Date & Time'].map((label) => (
                    <TableCell key={label} sx={{ color: 'text.secondary', fontWeight: 800 }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {DEMO_ACTIVITY.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.admin}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.ip}</TableCell>
                    <TableCell>{item.date}</TableCell>
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

export function ModelManagementPage() {
  return (
    <Box>
      <Typography className="eyebrow">AI / ML operations</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>ML model management</Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Card sx={surfaceSx}><CardContent sx={{ p: 3 }}><Typography variant="h6" fontWeight={800}>Current model</Typography><Stack spacing={1.5} sx={{ mt: 2 }}><Typography>Model Name: SignatureNet Pro</Typography><Typography>Version: v2.4.1</Typography><Typography>Status: Active</Typography><Typography>Accuracy: 94.2%</Typography><Typography>Threshold: 85%</Typography><Typography>Last Update: 2026-09-18</Typography></Stack></CardContent></Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card sx={surfaceSx}><CardContent sx={{ p: 3 }}><Typography variant="h6" fontWeight={800}>Performance</Typography><ResponsiveContainer width="100%" height={260}><BarChart data={performanceData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="value" fill="#14b8a6" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export function AdminSettingsPage() {
  return (
    <Box>
      <Typography className="eyebrow">Control center</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Admin settings</Typography>
      <Card sx={surfaceSx}><CardContent sx={{ p: 3 }}><Stack spacing={2}><TextField label="Admin Name" defaultValue="Omar Haddad" /><TextField label="Email" defaultValue="omar@signasecure.com" /><TextField label="Phone" defaultValue="+971 54 321 9876" /><TextField label="Verification Threshold" defaultValue="85%" /><TextField label="Notification Settings" defaultValue="Enabled" /><Button variant="contained" startIcon={<Settings />} sx={{ alignSelf: 'flex-start' }}>Save Changes</Button></Stack></CardContent></Card>
    </Box>
  );
}

function OperationalPanel({ icon: Icon, title, description }) {
  return (
    <Box>
      <Typography className="eyebrow">Administration</Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 3 }}>
        {title}
      </Typography>
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          <Icon sx={{ fontSize: 54, color: '#5eead4', mb: 1.5 }} />
          <Typography fontWeight={800}>{title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export function FraudMonitoring() {
  return <OperationalPanel icon={BugReport} title="Fraud monitoring" description="Review suspicious verification patterns and security signals." />;
}

export function AuditLogs() {
  return <OperationalPanel icon={History} title="Audit trail" description="Trace administrator actions and compliance-relevant events." />;
}

function AccessTimeIcon(props) {
  return <CalendarToday {...props} />;
}
