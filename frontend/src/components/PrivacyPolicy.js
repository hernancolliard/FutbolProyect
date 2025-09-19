import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

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
    <div style={{ padding: '20px', margin: '0 auto', maxWidth: '800px' }}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit' }}>
          {privacyContent}
        </pre>
      )}
    </div>
  );
}

export default PrivacyPolicy;
