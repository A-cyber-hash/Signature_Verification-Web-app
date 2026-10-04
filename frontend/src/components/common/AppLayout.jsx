import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, IconButton, Avatar,
  Badge, Tooltip, Divider, Menu, MenuItem, Chip, Button, useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Dashboard, Fingerprint, Verified, Analytics, Assessment,
  Settings, AdminPanelSettings, People, Security, Logout,
  Menu as MenuIcon, Notifications, KeyboardArrowDown,
  Shield, ChevronLeft, FiberManualRecord, BugReport,
  History, Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '@store/slices/authSlice';
import { toggleSidebar } from '@store/slices/uiSlice';
import toast from 'react-hot-toast';

const SIDEBAR_W = 260;

const NAV_ITEMS = [
  { label: 'Dashboard',        path: '/dashboard',          icon: Dashboard },
  { label: 'Verify Signature', path: '/verification',       icon: Verified },
  { label: 'My Signatures',    path: '/signatures/manage',  icon: Fingerprint },
  { label: 'Enroll New',       path: '/signatures/upload',  icon: Add },
  { label: 'Analytics',        path: '/analytics',          icon: Analytics },
  { label: 'Reports',          path: '/reports',            icon: Assessment },
  { label: 'Settings',         path: '/settings',           icon: Settings },
];

const ADMIN_ITEMS = [
  { label: 'Dashboard',          path: '/admin/dashboard',    icon: Dashboard },
  { label: 'Users',              path: '/admin/users',        icon: People },
  { label: 'Signatures',         path: '/admin/signatures',   icon: Fingerprint },
  { label: 'Verification',       path: '/admin/verification', icon: Verified },
  { label: 'Reports & Analytics', path: '/admin/reports',     icon: Analytics },
  { label: 'Notifications',      path: '/admin/notifications', icon: Notifications },
  { label: 'Admin Activity',     path: '/admin/activity',     icon: History },
  { label: 'ML Model',           path: '/admin/model',       icon: Security },
  { label: 'Settings',           path: '/admin/settings',    icon: Settings },
  { label: 'Logout',             path: '/login',             icon: Logout },
];

function SidebarContent({ onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAdmin } = useSelector(s => s.auth);

  const go = (path) => { navigate(path); onClose?.(); };
  const active = (path) => location.pathname === path;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield sx={{ fontSize: 22, color: '#fff' }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>SignaSecure</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Enterprise v1.0</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* User info */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}>
          <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', fontSize: '0.875rem', fontWeight: 700 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user?.first_name} {user?.last_name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{user?.role_type || 'user'}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <FiberManualRecord sx={{ fontSize: 10, color: '#10b981' }} />
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', px: 1.5, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
          Main Menu
        </Typography>
        <List dense disablePadding>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => go(path)}
                sx={{
                  borderRadius: 2, px: 1.5, py: 1,
                  background: active(path) ? 'linear-gradient(135deg,rgba(20,184,166,0.2),rgba(14,165,233,0.2))' : 'transparent',
                  border: active(path) ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon sx={{ fontSize: 20, color: active(path) ? '#14b8a6' : 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active(path) ? 600 : 400, color: active(path) ? '#14b8a6' : 'text.primary' }}
                />
                {active(path) && <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#14b8a6' }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {isAdmin && (
          <>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', px: 1.5, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.65rem' }}>
              Administration
            </Typography>
            <List dense disablePadding>
              {ADMIN_ITEMS.map(({ label, path, icon: Icon }) => (
                <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => go(path)}
                    sx={{ borderRadius: 2, px: 1.5, py: 1, background: active(path) ? 'rgba(239,68,68,0.1)' : 'transparent', border: active(path) ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon sx={{ fontSize: 20, color: active(path) ? '#ef4444' : 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active(path) ? 600 : 400, color: active(path) ? '#ef4444' : 'text.primary' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      {/* Status badge */}
      {!isAdmin && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AdminPanelSettings />}
            onClick={() => go('/admin/login')}
            sx={{
              borderColor: 'rgba(20,184,166,0.35)',
              color: '#5eead4',
              '&:hover': { borderColor: '#5eead4', background: 'rgba(20,184,166,0.08)' },
            }}
          >
            Admin login
          </Button>
        </Box>
      )}

      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>● ML Engine Active</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>85% match threshold</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AppLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector(s => s.ui);
  const { user, isAdmin } = useSelector(s => s.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const drawerContent = <SidebarContent onClose={() => setMobileOpen(false)} />;

  return (
    <Box className="page-shell" sx={{ display: 'flex', minHeight: '100vh', background: '#07111f' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? SIDEBAR_W : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: SIDEBAR_W, border: 'none', background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)', transition: 'width 0.2s ease' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_W, background: '#111827', border: 'none' } }}>
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <AppBar position="sticky" elevation={0}
          sx={{ background: 'rgba(7,17,31,0.82)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(148,163,184,0.12)', zIndex: 100 }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton onClick={() => isMobile ? setMobileOpen(true) : dispatch(toggleSidebar())} sx={{ color: 'text.secondary' }}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ flex: 1 }} />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User menu */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', p: 0.5, pl: 1.5, borderRadius: 2, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
            >
              <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', fontSize: '0.75rem', fontWeight: 700 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{user?.first_name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{user?.role_type}</Typography>
              </Box>
              <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', mt: 1, minWidth: 180 } }}>
              <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
                <Settings sx={{ mr: 1.5, fontSize: 18 }} /> Settings
              </MenuItem>
              {!isAdmin && (
                <MenuItem onClick={() => { navigate('/admin/login'); setAnchorEl(null); }}>
                  <AdminPanelSettings sx={{ mr: 1.5, fontSize: 18 }} /> Admin login
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem onClick={() => { navigate('/admin/dashboard'); setAnchorEl(null); }}>
                  <AdminPanelSettings sx={{ mr: 1.5, fontSize: 18 }} /> Admin dashboard
                </MenuItem>
              )}
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <Logout sx={{ mr: 1.5, fontSize: 18 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3.5 }, maxWidth: 1680, width: '100%', mx: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={window.location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
