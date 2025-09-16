import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useTranslation } from 'react-i18next';

function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      return;
    }
    if (!token) {
      setError(t('invalid_token'));
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post('/users/reset-password', { token, password });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ marginTop: '40px' }}>
      <h2>{t('reset_password_title')}</h2>
      {!token ? (
        <p className="error-message">{t('invalid_token_or_expired')}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">{t('new_password_label')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirm_new_password_label')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-main" disabled={loading}>
            {loading ? t('updating_password') : t('update_password_button')}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPasswordPage;
