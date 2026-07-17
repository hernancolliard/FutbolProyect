'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

const AdminRoute = ({ children }) => {
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner text={t('loading')} />;
  }

  if (!user || !user.isadmin) {
    // Redirect them to the home page if they are not an admin
    router.push("/");
    return null; // Return null or a loading state while redirecting
  }

  return children;
};

export default AdminRoute;
