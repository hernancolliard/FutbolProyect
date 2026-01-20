'use client';

import React, { useState, useEffect } from 'react';
import apiClient from "@/lib/apiClient"; // Centralized apiClient // Centralized apiClient
import LoadingSpinner from "@/components/LoadingSpinner"; // Migrated LoadingSpinner
import { useTranslation } from 'react-i18next';
// import { Helmet } from 'react-helmet-async'; // Replaced by Next.js metadata
import { Box, Typography, CircularProgress } from '@mui/material'; // Material UI components



export default function PrivacyPolicy() {
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('common');

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await apiClient.get('/privacy');
        setPrivacyContent(response.data);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setPrivacyContent(t('error_fetching_privacy', 'Error al cargar la política de privacidad.'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, [t]);

  // Dynamic SEO update for client components
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('privacy_seo_title', 'Política de Privacidad - FutbolProyect');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('privacy_seo_desc', 'Consulta nuestra política de privacidad para entender cómo FutbolProyect recopila, usa y protege tu información personal.'));
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = t('privacy_seo_desc', 'Consulta nuestra política de privacidad para entender cómo FutbolProyect recopila, usa y protege tu información personal.');
        document.head.appendChild(newMetaTag);
      }
    }
  }, [t]);

  return (
    <Box sx={{ p: 3, margin: '0 auto', maxWidth: '800px' }}>
      {loading ? (
        <LoadingSpinner text={t('loading_privacy_policy', 'Cargando política de privacidad...')} />
      ) : (
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit', color: 'black' }}>
          {privacyContent}
        </Typography>
      )}
    </Box>
  );
}
