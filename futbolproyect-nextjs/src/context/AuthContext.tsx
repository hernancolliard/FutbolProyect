"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
      // IMPORTANTE: no guardamos token, backend lo guarda en cookie
      await apiClient.post("/users/login", { email, password });

      // Luego traemos el usuario (ya autenticado por cookie)
      await fetchUser();
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signIn("google");
      if (result?.ok) {
        // Después de un inicio de sesión exitoso con Google,
        // NextAuth se encarga de la sesión.
        // Forzamos un refetch del usuario para sincronizar el estado.
        await fetchUser();
      }
      return result;
    } catch (error) {
      console.error("Error during Google login:", error);
      throw error;
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
