import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard,
  People,
  Fingerprint,
  VerifiedUser,
  BarChart,
  NotificationsNone,
  Notifications,
  History,
  Settings,
  Logout,
  BugReport,
  TrendingUp,
  Security,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@store/slices/authSlice';

const DRAWER_WIDTH = 280;

const menuItems = [
  { label: 'Dashboard', icon: Dashboard, path: '/admin/dashboard' },
  { label: 'User Management', icon: People, path: '/admin/users' },
  { label: 'Signatures', icon: Fingerprint, path: '/admin/signatures' },
  { label: 'Verifications', icon: VerifiedUser, path: '/admin/verification' },
  { label: 'Reports & Analytics', icon: BarChart, path: '/admin/reports' },
  { label: 'Notifications', icon: Notifications, path: '/admin/notifications', badge: 3 },
  { label: 'Activity Logs', icon: History, path: '/admin/activity' },
  { label: 'ML Models', icon: TrendingUp, path: '/admin/model' },
  { label: 'Fraud Monitoring', icon: BugReport, path: '/admin/fraud' },
  { label: 'Audit Trail', icon: Security, path: '/admin/audit' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/admin/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(148,163,184,.16)' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            S
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              SignaSecure
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Enterprise Admin
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: isActive ? '#14b8a6' : 'text.primary',
                backgroundColor: isActive ? 'rgba(20,184,166,.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(20,184,166,.08)',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#14b8a6' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(148,163,184,.16)' }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          System Status
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
          <Typography variant="caption" color="text.secondary">
            All systems operational
          </Typography>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, rgba(15,23,42,.95) 0%, rgba(30,41,59,.95) 100%)',
            border: '1px solid rgba(148,163,184,.16)',
            borderRight: '1px solid rgba(148,163,184,.16)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          sx={{
            background: 'linear-gradient(90deg, rgba(30,41,59,.95) 0%, rgba(15,23,42,.95) 100%)',
            border: '1px solid rgba(148,163,184,.16)',
            borderBottom: '1px solid rgba(148,163,184,.16)',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={handleDrawerToggle}
                  sx={{ color: '#94a3b8' }}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              )}
              <Typography variant="h6" fontWeight={800} sx={{ color: '#f1f5f9' }}>
                Admin Control Center
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton sx={{ color: '#94a3b8' }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>

              <Avatar
                onClick={handleMenuOpen}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                {user?.name?.charAt(0) || 'A'}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))',
                    border: '1px solid rgba(148,163,184,.16)',
                  },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.name || 'Admin'}
                  </Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { navigate('/admin/settings'); handleMenuClose(); }}>
                  <Settings fontSize="small" sx={{ mr: 1 }} />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1, color: '#ef4444' }} />
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
            bgcolor: '#0f172a',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
