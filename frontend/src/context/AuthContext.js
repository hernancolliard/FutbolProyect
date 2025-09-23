import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar la app, llama al endpoint /me para ver si hay una sesión activa (via cookie)
    const checkUser = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (error) {
        // Si hay un error (ej. 401), significa que no hay usuario autenticado
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = (userData) => {
    // El backend ya ha establecido la cookie. Aquí solo actualizamos el estado en React.
    setUser(userData);
  };

  const logout = async (navigate) => {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      if (navigate) {
        navigate('/'); // Redirigir a la página de inicio
      }
    }
  };

  const authContextValue = {
    user,
    setUser, // Exponer setUser para permitir actualizaciones de perfil
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};