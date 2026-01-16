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
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      console.log("User data from /users/me:", response.data); // Debugging line
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

  // En src/context/AuthContext.tsx

  // ... imports

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Hacemos la petición al backend
      // Al usar apiClient con withCredentials, la cookie se guarda sola automáticamente.
      await apiClient.post("/users/login", { email, password });

      // 2. Si no dio error, pedimos los datos del usuario para actualizar la app
      await fetchUser();

      return true; // Indicamos éxito
    } catch (error) {
      console.error("Error en login:", error);
      throw error; // Lanzamos el error para que el componente Login lo muestre
    } finally {
      setLoading(false);
    }
  };
  // Agregar dentro del AuthProvider, junto a login y logout

  const loginWithGoogle = async (id_token: string) => {
    setLoading(true);
    try {
      // 1. Enviamos el token al backend (que seteará la cookie)
      await apiClient.post("/users/auth/google", { id_token });

      // 2. Actualizamos el estado del usuario
      await fetchUser();

      return true;
    } catch (error) {
      console.error("Error en Google Login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ¡No olvides agregar loginWithGoogle al objeto value que retorna el Provider!
  // value={{ user, login, logout, loginWithGoogle, ... }}

  const logout = async () => {
    // Removed 'navigate' parameter
    try {
      await apiClient.post("/users/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      router.push("/"); // Redirect to the home page using useRouter
    }
  };

  const authContextValue = {
    user,
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
