import React, { useState } from 'react';
import apiClient from '../services/api';
import { useTranslation } from 'react-i18next';

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post('/users/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '40px' }}>
      <h2>{t('forgot_password_title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t('email_label')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-main" disabled={loading}>
          {loading ? t('sending_email') : t('send_reset_link')}
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
