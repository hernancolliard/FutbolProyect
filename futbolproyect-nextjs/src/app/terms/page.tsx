'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient'; // Centralized apiClient
import LoadingSpinner from "@/components/LoadingSpinner"; // Migrated LoadingSpinner
import { useTranslation } from 'react-i18next';
// import { Helmet } from 'react-helmet-async'; // Replaced by Next.js metadata
import { Box, Typography, CircularProgress } from '@mui/material'; // Material UI components



export default function TermsOfService() {
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('common');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await apiClient.get('/terms');
        setTermsContent(response.data);
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTermsContent(t('error_fetching_terms', 'Error al cargar los términos de servicio.'));
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [t]);

  // Dynamic SEO update for client components
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('terms_seo_title', 'Términos de Servicio - FutbolProyect');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', t('terms_seo_desc', 'Lee los términos y condiciones de servicio para el uso de la plataforma FutbolProyect. Entiende tus derechos y obligaciones como usuario.'));
      } else {
        const newMetaTag = document.createElement('meta');
        newMetaTag.name = 'description';
        newMetaTag.content = t('terms_seo_desc', 'Lee los términos y condiciones de servicio para el uso de la plataforma FutbolProyect. Entiende tus derechos y obligaciones como usuario.');
        document.head.appendChild(newMetaTag);
      }
    }
  }, [t]);

  return (
    <Box sx={{ p: 3, margin: '0 auto', maxWidth: '800px' }}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit', color: 'white' }}>
          {termsContent}
        </Typography>
      )}
    </Box>
  );
}
