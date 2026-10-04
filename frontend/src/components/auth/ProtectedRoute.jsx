import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, adminRequired = false }) {
  const { isAuthenticated, isAdmin } = useSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to={adminRequired ? '/admin/login' : '/login'} replace />;
  }

  if (adminRequired && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminRequired && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
