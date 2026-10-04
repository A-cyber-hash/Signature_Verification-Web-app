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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Search,
  Download,
  Refresh,
  Visibility,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
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

const DEMO_VERIFICATIONS = [
  { id: 'VER-2401', user: 'Ibrahim Ali', result: 'Genuine', score: 96, date: '2024-09-20 10:40', status: 'Completed', confidence: 96 },
  { id: 'VER-2402', user: 'Aisha Khan', result: 'Forged', score: 12, date: '2024-09-20 11:15', status: 'Flagged', confidence: 12 },
  { id: 'VER-2403', user: 'Daniel Smith', result: 'Genuine', score: 94, date: '2024-09-20 09:00', status: 'Completed', confidence: 94 },
  { id: 'VER-2404', user: 'Priya Nair', result: 'Pending', score: 0, date: '2024-09-20 14:50', status: 'Pending', confidence: 0 },
  { id: 'VER-2405', user: 'Omar Haddad', result: 'Genuine', score: 98, date: '2024-09-20 08:30', status: 'Completed', confidence: 98 },
  { id: 'VER-2406', user: 'Ibrahim Ali', result: 'Genuine', score: 92, date: '2024-09-20 07:15', status: 'Completed', confidence: 92 },
];

export default function EnhancedVerificationManagement() {
  const [verifications, setVerifications] = useState(DEMO_VERIFICATIONS);
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const visibleVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const haystack = `${v.id} ${v.user} ${v.result}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesResult = filterResult === 'all' || v.result === filterResult;
      const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
      return matchesSearch && matchesResult && matchesStatus;
    });
  }, [verifications, search, filterResult, filterStatus]);

  const stats = {
    total: verifications.length,
    genuine: verifications.filter((v) => v.result === 'Genuine').length,
    forged: verifications.filter((v) => v.result === 'Forged').length,
    pending: verifications.filter((v) => v.result === 'Pending').length,
    avgScore: (verifications.filter((v) => v.score > 0).reduce((sum, v) => sum + v.score, 0) / verifications.filter((v) => v.score > 0).length).toFixed(1),
  };

  const handleViewDetails = (verification) => {
    setSelectedVerification(verification);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedVerification(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleApprove = (id) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Completed', result: 'Genuine' } : v))
    );
  };

  const handleReject = (id) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'Flagged', result: 'Forged' } : v))
    );
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
            Verification Management
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Monitor and manage signature verification results
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Refresh verifications">
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
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Total Verifications
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {stats.total}
                  </Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, background: 'rgba(20,184,166,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>
                  <TrendingUp />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Genuine
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#10b981' }}>
                    {stats.genuine}
                  </Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckCircle />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Forged
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#ef4444' }}>
                    {stats.forged}
                  </Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, background: 'rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Cancel />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={surfaceSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Avg Confidence
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#0ea5e9' }}>
                    {stats.avgScore}%
                  </Typography>
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, background: 'rgba(14,165,233,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                  <TrendingUp />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={surfaceSx}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, user, or result..."
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
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Results</MenuItem>
              <MenuItem value="Genuine">Genuine</MenuItem>
              <MenuItem value="Forged">Forged</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Flagged">Flagged</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card sx={{ ...surfaceSx, mt: 2.5 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ borderBottom: '1px solid rgba(148,163,184,.16)' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>ID</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>User</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Result</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Confidence</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Date & Time</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 800, p: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleVerifications.map((verification) => (
                  <TableRow
                    hover
                    key={verification.id}
                    sx={{
                      borderBottom: '1px solid rgba(148,163,184,.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(20,184,166,.05)',
                      },
                    }}
                  >
                    <TableCell sx={{ p: 2, fontWeight: 600 }}>{verification.id}</TableCell>
                    <TableCell sx={{ p: 2 }}>{verification.user}</TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Chip
                        label={verification.result}
                        size="small"
                        color={
                          verification.result === 'Genuine'
                            ? 'success'
                            : verification.result === 'Forged'
                            ? 'error'
                            : 'warning'
                        }
                        variant="outlined"
                        icon={
                          verification.result === 'Genuine' ? (
                            <CheckCircle sx={{ fontSize: 14 }} />
                          ) : verification.result === 'Forged' ? (
                            <Cancel sx={{ fontSize: 14 }} />
                          ) : (
                            <Schedule sx={{ fontSize: 14 }} />
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {verification.confidence}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={verification.confidence}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,.08)',
                            '& .MuiLinearProgress-bar': {
                              background:
                                verification.confidence >= 80
                                  ? '#10b981'
                                  : verification.confidence >= 50
                                  ? '#f59e0b'
                                  : '#ef4444',
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ p: 2, color: 'text.secondary' }}>
                      <Typography variant="body2">{verification.date}</Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Chip
                        label={verification.status}
                        size="small"
                        color={
                          verification.status === 'Completed'
                            ? 'success'
                            : verification.status === 'Flagged'
                            ? 'error'
                            : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(verification)}
                            sx={{
                              color: '#14b8a6',
                              '&:hover': { bgcolor: 'rgba(20,184,166,.1)' },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {verification.status === 'Pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => handleApprove(verification.id)}
                                sx={{
                                  color: '#10b981',
                                  '&:hover': { bgcolor: 'rgba(16,185,129,.1)' },
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                onClick={() => handleReject(verification.id)}
                                sx={{
                                  color: '#ef4444',
                                  '&:hover': { bgcolor: 'rgba(239,68,68,.1)' },
                                }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Verification Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedVerification && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)', bgcolor: 'rgba(20,184,166,.05)' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Verification ID
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {selectedVerification.id}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      User
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedVerification.user}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Result
                    </Typography>
                    <Chip
                      label={selectedVerification.result}
                      size="small"
                      color={
                        selectedVerification.result === 'Genuine'
                          ? 'success'
                          : selectedVerification.result === 'Forged'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Confidence Score
                    </Typography>
                    <Typography variant="body2" fontWeight={800}>
                      {selectedVerification.confidence}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Status
                    </Typography>
                    <Chip label={selectedVerification.status} size="small" color={selectedVerification.status === 'Completed' ? 'success' : 'warning'} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(148,163,184,.16)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Date & Time
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedVerification.date}
                    </Typography>
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
