import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { AuthProvider } from '../context/AuthContext';
import Header from './Header';

describe('Header', () => {
  test('renders Header component', () => {
    render(
      <Router>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <Header />
          </AuthProvider>
        </I18nextProvider>
      </Router>
    );

    expect(screen.getByAltText(/FP FutbolProyect/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/offers/i)).toBeInTheDocument();
    expect(screen.getByText(/subscriptions/i)).toBeInTheDocument();
  });
});
