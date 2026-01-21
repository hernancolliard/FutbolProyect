"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await apiClient.post("/users/login", { email, password });
      await fetchUser();
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    try {
      // Backend se encargará de validar el token y crear/loguear al usuario
      await apiClient.post("/users/google-login", { token });
      // Luego traemos el usuario (ya autenticado por cookie)
      await fetchUser();
      return true;
    } catch (error) {
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
      router.push("/");
    }
  };

  const authContextValue = {
    user,
    login,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
