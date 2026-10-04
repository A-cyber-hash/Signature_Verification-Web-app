import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Eye,
  PersonAdd,
} from '@mui/icons-material';
import api from '../../services/api';

const statusColors = {
  active: { color: 'success', label: 'Active' },
  blocked: { color: 'error', label: 'Blocked' },
  inactive: { color: 'warning', label: 'Inactive' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockDialog, setBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, filterStatus, sortBy]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        ordering: sortBy,
      };
      const { data } = await api.get('/admin/users/', { params });
      setUsers(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      `${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await api.post(`/admin/users/${selectedUser.id}/block/`, { reason: blockReason });
      setBlockDialog(false);
      setBlockReason('');
      loadUsers();
    } catch (err) {
      setError('Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setActionLoading(true);
      await api.post(`/admin/users/${userId}/unblock/`);
      loadUsers();
    } catch (err) {
      setError('Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await api.delete(`/admin/users/${userId}/`);
        loadUsers();
      } catch (err) {
        setError('Failed to delete user');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 1 }}>
            User Management
          </Typography>
          <Typography color="text.secondary">
            Manage system users, permissions, and access.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAdd />} sx={{ bgcolor: '#14b8a6', color: '#062b35' }}>
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{
        background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 3,
        mb: 3,
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#94a3b8' }} />
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="-created_at">Newest First</MenuItem>
              <MenuItem value="created_at">Oldest First</MenuItem>
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="-name">Name (Z-A)</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{
        background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
        border: '1px solid rgba(148,163,184,.16)',
        borderRadius: 3,
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(20,184,166,.05)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Phone</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Verifications</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Registered</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Last Login</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#14b8a6' }}>
                          {user.name?.[0] || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{user.email}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{user.phone || '-'}</TableCell>
                    <TableCell sx={{ color: '#f1f5f9' }}>{user.total_verifications || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusColors[user.status]?.label || user.status}
                        color={statusColors[user.status]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Eye />}
                          sx={{ color: '#14b8a6' }}
                          onClick={() => window.location.href = `/admin/users/${user.id}`}
                        >
                          View
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Block />}
                            sx={{ color: '#ef4444' }}
                            onClick={() => {
                              setSelectedUser(user);
                              setBlockDialog(true);
                            }}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<CheckCircle />}
                            sx={{ color: '#10b981' }}
                            onClick={() => handleUnblockUser(user.id)}
                          >
                            Unblock
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Delete />}
                          sx={{ color: '#ef4444' }}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          sx={{
            '& .MuiPaginationItem-root': { color: '#94a3b8' },
            '& .Mui-selected': { bgcolor: '#14b8a6 !important', color: '#062b35' },
          }}
        />
      </Box>

      {/* Block User Dialog */}
      <Dialog open={blockDialog} onClose={() => setBlockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Block User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Are you sure you want to block {selectedUser?.name}? They will not be able to login or perform verifications.
          </Typography>
          <TextField
            fullWidth
            label="Block Reason (Optional)"
            multiline
            rows={3}
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Enter reason for blocking this user"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog(false)}>Cancel</Button>
          <Button
            onClick={handleBlockUser}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Block User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
