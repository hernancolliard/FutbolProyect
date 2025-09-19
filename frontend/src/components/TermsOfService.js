import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

function TermsOfService() {
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await apiClient.get('/terms');
        setTermsContent(response.data);
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTermsContent(t('error_fetching_terms'));
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [t]);

  return (
    <div style={{ padding: '20px', margin: '0 auto', maxWidth: '800px' }}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit' }}>
          {termsContent}
        </pre>
      )}
    </div>
  );
}

export default TermsOfService;
