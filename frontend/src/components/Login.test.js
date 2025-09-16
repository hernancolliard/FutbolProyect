
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Mock de dependencias externas
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Devuelve la clave de traducción en lugar del texto traducido
  }),
}));

describe('Login Component', () => {
  const handleLoginSuccess = jest.fn();
  const handleClose = jest.fn();

  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    handleLoginSuccess.mockClear();
    handleClose.mockClear();
  });

  test('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <Login onLoginSuccess={handleLoginSuccess} onClose={handleClose} />
      </MemoryRouter>
    );

    // Verifica que el título se renderice
    expect(screen.getByText('login_title')).toBeInTheDocument();

    // Verifica que los campos de entrada estén presentes
    expect(screen.getByPlaceholderText('email_placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password_placeholder')).toBeInTheDocument();

    // Verifica que los botones estén presentes
    expect(screen.getByRole('button', { name: 'login_button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cancel_button' })).toBeInTheDocument();

    // Verifica que el enlace para recuperar contraseña esté presente
    expect(screen.getByText('forgot_your_password')).toBeInTheDocument();
  });
});
