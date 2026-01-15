'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isadmin) {
    // Redirect them to the home page if they are not an admin
    router.push("/");
    return null; // Return null or a loading state while redirecting
  }

  return children;
};

export default AdminRoute;
