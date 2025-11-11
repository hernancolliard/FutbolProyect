import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

function PrivacyPolicy() {
  const [privacyContent, setPrivacyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await apiClient.get('/privacy');
        setPrivacyContent(response.data);
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setPrivacyContent(t('error_fetching_privacy'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacy();
  }, [t]);

  return (
    <>
      <Helmet>
        <title>{t('privacy_seo_title', 'Política de Privacidad - FutbolProyect')}</title>
        <meta name="description" content={t('privacy_seo_desc', 'Consulta nuestra política de privacidad para entender cómo FutbolProyect recopila, usa y protege tu información personal.')} />
      </Helmet>
      <div style={{ padding: '20px', margin: '0 auto', maxWidth: '800px' }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit' }}>
            {privacyContent}
          </pre>
        )}
      </div>
    </>
  );
}

export default PrivacyPolicy;
