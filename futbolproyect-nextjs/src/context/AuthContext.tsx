"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import apiClient from "@/lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    fetchUser();
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      console.log("User data from /users/me:", response.data); // Debugging line
      setUser(response.data);
    } catch (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/users/login", { email, password });
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true; // Indicamos éxito
    } catch (error) {
      console.error("Error en login:", error);
      throw error; // Lanzamos el error para que el componente Login lo muestre
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (id_token: string) => {
    setLoading(true);
    try {
      // Assuming google login also returns user and token
      const response = await apiClient.post("/users/auth/google", { id_token });
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (error) {
      console.error("Error en Google Login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/users/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      router.push("/"); // Redirect to the home page using useRouter
    }
  };

  const authContextValue = {
    user,
    token,
    setUser, // Exponer setUser para permitir actualizaciones de perfil
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    loading,
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
