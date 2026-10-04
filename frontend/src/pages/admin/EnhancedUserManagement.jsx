import React, { useState, useMemo } from 'react';
import {
  Box,
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
  Avatar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Block,
  Restore,
  Visibility,
  MoreVert,
  Download,
  Refresh,
  Mail,
  Phone,
  Shield,
  CheckCircle,
} from '@mui/icons-material';

const surfaceSx = {
  background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))',
  border: '1px solid rgba(148,163,184,.16)',
  borderRadius: 3,
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(148,163,184,.32)',
    boxShadow: '0 8px 24px rgba(20,184,166,.1)',
  },
};

const DEMO_USERS = [
  { id: 'USR-1001', name: 'Ibrahim Ali', email: 'ibrahim@signasecure.com', phone: '+971 55 123 4567', role: 'User', status: 'active', verifications: 28, registered: '2025-06-14', lastLogin: '2 hours ago', mfa: true },
  { id: 'USR-1002', name: 'Aisha Khan', email: 'aisha@signasecure.com', phone: '+971 50 222 3344', role: 'User', status: 'blocked', verifications: 11, registered: '2025-05-20', lastLogin: '5 days ago', mfa: false },
  { id: 'USR-1003', name: 'Daniel Smith', email: 'daniel@signasecure.com', phone: '+971 58 998 1122', role: 'Analyst', status: 'active', verifications: 46, registered: '2025-02-05', lastLogin: '30 min ago', mfa: true },
  { id: 'USR-1004', name: 'Priya Nair', email: 'priya@signasecure.com', phone: '+971 52 889 7712', role: 'User', status: 'inactive', verifications: 7, registered: '2025-01-11', lastLogin: '2 months ago', mfa: false },
  { id: 'USR-1005', name: 'Omar Haddad', email: 'omar@signasecure.com', phone: '+971 54 321 9876', role: 'Admin', status: 'active', verifications: 62, registered: '2024-11-02', lastLogin: '10 min ago', mfa: true },
];

const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function EnhancedUserManagement() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view');
  const [refreshing, setRefreshing] = useState(false);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, filterStatus, filterRole]);

  const uniqueRoles = [...new Set(users.map((u) => u.role))];

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDialogMode('view');
    setShowDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setDialogMode('edit');
    setShowDialog(true);
  };

  const handleBlockUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'blocked' } : u))
    );
  };

  const handleUnblockUser = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
  };

  const handleDeleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setShowDialog(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            User Management
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Manage member access, account status, and security settings
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh users">
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
            variant="outlined"
            startIcon={<Download />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add User
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..."
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: '#94a3b8' }} />
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
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {uniqueRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            <Chip
              label={`${visibleUsers.length} users`}
              variant="outlined"
              color="primary"
              sx={{ alignSelf: 'center' }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ ...surfaceSx, mt: 2.5 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: '1px solid rgba(148,163,184,.16)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>User</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Email</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Role</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Verifications</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Last Login</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.map((user) => (
                  <TableRow
                    hover
                    key={user.id}
                    sx={{
                      borderBottom: '1px solid rgba(148,163,184,.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(20,184,166,.05)',
                      },
                    }}
                  >
                    <TableCell sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                          }}
                        >
                          {initials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Mail sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Chip
                        label={user.role}
                        size="small"
                        variant="outlined"
                        icon={user.role === 'Admin' ? <Shield sx={{ fontSize: 14 }} /> : undefined}
                        sx={{
                          borderColor: user.role === 'Admin' ? '#14b8a6' : '#94a3b8',
                          color: user.role === 'Admin' ? '#14b8a6' : '#94a3b8',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {user.verifications}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Chip
                        label={user.status}
                        size="small"
                        color={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'blocked'
                            ? 'error'
                            : 'warning'
                        }
                        variant="outlined"
                        icon={user.status === 'active' ? <CheckCircle sx={{ fontSize: 14 }} /> : undefined}
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2, color: 'text.secondary' }}>
                      <Typography variant="body2">{user.lastLogin}</Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                            sx={{
                              color: '#14b8a6',
                              '&:hover': { bgcolor: 'rgba(20,184,166,.1)' },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit user">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{
                              color: '#0ea5e9',
                              '&:hover': { bgcolor: 'rgba(14,165,233,.1)' },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.status === 'blocked' ? (
                          <Tooltip title="Unblock user">
                            <IconButton
                              size="small"
                              onClick={() => handleUnblockUser(user.id)}
                              sx={{
                                color: '#10b981',
                                '&:hover': { bgcolor: 'rgba(16,185,129,.1)' },
                              }}
                            >
                              <Restore fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Block user">
                            <IconButton
                              size="small"
                              onClick={() => handleBlockUser(user.id)}
                              sx={{
                                color: '#ef4444',
                                '&:hover': { bgcolor: 'rgba(239,68,68,.1)' },
                              }}
                            >
                              <Block fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{
                              color: '#f59e0b',
                              '&:hover': { bgcolor: 'rgba(245,158,11,.1)' },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {dialogMode === 'view' ? 'User Details' : 'Edit User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                    fontWeight: 800,
                    fontSize: '2rem',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  {initials(selectedUser.name)}
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  {selectedUser.name}
                </Typography>
                <Chip
                  label={selectedUser.status}
                  size="small"
                  color={
                    selectedUser.status === 'active'
                      ? 'success'
                      : selectedUser.status === 'blocked'
                      ? 'error'
                      : 'warning'
                  }
                  sx={{ mt: 1 }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Mail sx={{ fontSize: 18, color: '#14b8a6' }} />
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Phone sx={{ fontSize: 18, color: '#0ea5e9' }} />
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.phone}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Role
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.role}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Verifications
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.verifications}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Registered
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.registered}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Last Login
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedUser.lastLogin}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Shield sx={{ fontSize: 18, color: selectedUser.mfa ? '#10b981' : '#94a3b8' }} />
                      <Typography variant="body2">MFA Enabled</Typography>
                    </Stack>
                    <Chip
                      label={selectedUser.mfa ? 'Yes' : 'No'}
                      size="small"
                      color={selectedUser.mfa ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
          {dialogMode === 'view' && (
            <>
              <Button
                onClick={() => handleEditUser(selectedUser)}
                variant="outlined"
                startIcon={<Edit />}
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDeleteUser(selectedUser.id)}
                variant="outlined"
                color="error"
                startIcon={<Delete />}
              >
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
