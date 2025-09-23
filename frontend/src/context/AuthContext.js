import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = () => {
    // Después de un login exitoso, el backend ya ha establecido la cookie.
    // Volvemos a obtener los datos del usuario para actualizar el estado.
    setLoading(true); // Opcional: mostrar un spinner mientras se recargan los datos
    fetchUser();
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