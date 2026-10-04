import React, { Suspense, useEffect, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Layout & common
import AppLayout from '@components/common/AppLayout';
import { LoadingScreen, ErrorBoundary } from '@components/common/LoadingScreen';
import ProtectedRoute from '@components/auth/ProtectedRoute';

// Auth pages (eager — needed immediately)
import AuthPortalSelector from '@pages/auth/AuthPortalSelector';
import LoginPage from '@pages/auth/LoginPage';
import AdminLoginPage from '@pages/auth/AdminLoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import LandingPage from '@pages/LandingPage';
import NotFoundPage from '@pages/NotFoundPage';

// App pages (lazy)
const DashboardPage      = lazy(() => import('@pages/dashboard/DashboardPage'));
const VerificationPage   = lazy(() => import('@pages/verification/VerificationPage'));
const SignatureUploadPage = lazy(() => import('@pages/signatures/SignatureUploadPage'));
const SignatureManagement = lazy(() => import('@pages/signatures/SignatureManagement'));
const AnalyticsPage      = lazy(() => import('@pages/analytics/AnalyticsPage'));
const ReportsPage        = lazy(() => import('@pages/reports/ReportsPage'));
const SettingsPage       = lazy(() => import('@pages/settings/SettingsPage'));

// Admin pages (lazy)
const AdminLayout             = lazy(() => import('@pages/admin/AdminLayout'));
const AdminDashboardPage      = lazy(() => import('@pages/admin/ProfessionalAdminDashboard'));
const UserManagement          = lazy(() => import('@pages/admin/EnhancedUserManagement'));
const SignatureManagementPage = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.SignatureManagementPage })));
const VerificationManagementPage = lazy(() => import('@pages/admin/EnhancedVerificationManagement'));
const ReportsAnalyticsPage    = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.ReportsAnalyticsPage })));
const NotificationsPage       = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.NotificationsPage })));
const AdminActivityPage       = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.AdminActivityPage })));
const ModelManagementPage     = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.ModelManagementPage })));
const AdminSettingsPage       = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.AdminSettingsPage })));
const FraudMonitoring         = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.FraudMonitoring })));
const AuditLogs               = lazy(() => import('@pages/admin/AdminPages').then(m => ({ default: m.AuditLogs })));

import { initializeAuth } from '@store/slices/authSlice';
import { LanguageProvider } from '@context/LanguageContext';

// Mobile pages (lazy)
const MobileApp = lazy(() => import('@pages/mobile/MobileApp'));

const PageFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <CircularProgress sx={{ color: '#14b8a6' }} />
  </Box>
);

// Wrap protected pages with layout
function LayoutRoute({ children, adminRequired = false }) {
  return (
    <ProtectedRoute adminRequired={adminRequired}>
      <AppLayout>
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.auth);

  useEffect(() => { dispatch(initializeAuth()); }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Routes>
        {/* Public */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/auth"          element={<AuthPortalSelector />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/admin/login"   element={<AdminLoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route path="/dashboard"         element={<LayoutRoute><DashboardPage /></LayoutRoute>} />
        <Route path="/verification"      element={<LayoutRoute><VerificationPage /></LayoutRoute>} />
        <Route path="/signatures/upload" element={<LayoutRoute><SignatureUploadPage /></LayoutRoute>} />
        <Route path="/signatures/manage" element={<LayoutRoute><SignatureManagement /></LayoutRoute>} />
        <Route path="/analytics"         element={<LayoutRoute><AnalyticsPage /></LayoutRoute>} />
        <Route path="/reports"           element={<LayoutRoute><ReportsPage /></LayoutRoute>} />
        <Route path="/settings"          element={<LayoutRoute><SettingsPage /></LayoutRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard"     element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><AdminDashboardPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users"         element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><UserManagement /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/signatures"    element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><SignatureManagementPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/verification"  element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><VerificationManagementPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/reports"       element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><ReportsAnalyticsPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><NotificationsPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/activity"      element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><AdminActivityPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/model"         element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><ModelManagementPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings"      element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><AdminSettingsPage /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/fraud"         element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><FraudMonitoring /></Suspense></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/audit"         element={<ProtectedRoute adminRequired><AdminLayout><Suspense fallback={<PageFallback />}><AuditLogs /></Suspense></AdminLayout></ProtectedRoute>} />

        {/* Redirect */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* Mobile App */}
        <Route path="/mobile" element={<Suspense fallback={<PageFallback />}><MobileApp /></Suspense>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
    </LanguageProvider>
  );
}

export default App;
