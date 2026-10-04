import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Image,
  VerifiedUser,
  BarChart,
  Notifications,
  History,
  Settings,
  Logout,
  Menu as MenuIcon,
  Close,
  ChevronDown,
  Bell,
  Shield,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const DRAWER_WIDTH = 280;

const menuItems = [
  { label: 'Dashboard', icon: Dashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: People, path: '/admin/users' },
  { label: 'Signatures', icon: Image, path: '/admin/signatures' },
  { label: 'Verification', icon: VerifiedUser, path: '/admin/verification' },
  { label: 'Reports & Analytics', icon: BarChart, path: '/admin/reports' },
  { label: 'Notifications', icon: Notifications, path: '/admin/notifications' },
  { label: 'Admin Activity', icon: History, path: '/admin/activity' },
  { label: 'ML Model', icon: Shield, path: '/admin/ml-model' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #14b8a6, #5eead4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#062b35',
            fontWeight: 900,
            fontSize: '1.2rem',
          }}
        >
          S
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#f1f5f9' }}>
            SignaSecure
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148,163,184,.2)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                color: isActive ? '#14b8a6' : '#94a3b8',
                bgcolor: isActive ? 'rgba(20,184,166,.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(20,184,166,.08)',
                  color: '#14b8a6',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148,163,184,.2)' }} />

      {/* Logout */}
      <ListItem
        button
        onClick={handleLogout}
        sx={{
          m: 1,
          borderRadius: 2,
          color: '#ef4444',
          '&:hover': { bgcolor: 'rgba(239,68,68,.1)' },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
          <Logout />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e27' }}>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#0f172a',
            border: 'none',
            borderRight: '1px solid rgba(148,163,184,.1)',
          },
          display: { xs: 'none', md: 'block' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: '#0f172a',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          sx={{
            bgcolor: '#111827',
            border: 'none',
            borderBottom: '1px solid rgba(148,163,184,.1)',
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {mobileOpen ? <Close /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9' }}>
                Admin Dashboard
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(e) => setNotificationAnchor(e.currentTarget)}
                  sx={{ color: '#94a3b8' }}
                >
                  <Badge badgeContent={3} color="error">
                    <Bell />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile */}
              <Box
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(148,163,184,.1)' },
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#14b8a6' }}>
                  {user?.first_name?.[0] || 'A'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    {user?.first_name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Administrator
                  </Typography>
                </Box>
                <ChevronDown sx={{ fontSize: 18, color: '#64748b' }} />
              </Box>

              {/* Profile Menu */}
              <Menu
                anchorEl={profileAnchor}
                open={!!profileAnchor}
                onClose={() => setProfileAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: '#1e293b',
                    border: '1px solid rgba(148,163,184,.2)',
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings sx={{ mr: 1 }} /> Settings
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={!!notificationAnchor}
                onClose={() => setNotificationAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: '#1e293b',
                    border: '1px solid rgba(148,163,184,.2)',
                    borderRadius: 2,
                    minWidth: 300,
                  },
                }}
              >
                <MenuItem>New user registered</MenuItem>
                <MenuItem>Forged signature detected</MenuItem>
                <MenuItem>System update available</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
