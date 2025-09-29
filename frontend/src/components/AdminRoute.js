import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isadmin) {
    // Redirect them to the home page if they are not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
