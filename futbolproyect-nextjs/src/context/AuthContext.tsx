"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");

    if (!storedToken || storedToken === "null") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get("/users/me");
      setUser(res.data);
    } catch (error: any) {
      console.error("Error fetching user:", error.response?.status, error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/users/login", { email, password });
      // store token if returned
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        apiClient.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      }
      await fetchUser();
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (token: string, acceptedTerms = false) => {
    try {
      const res = await apiClient.post("/users/google-login", {
        token,
        acceptedTerms,
      });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        apiClient.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      }
      await fetchUser();
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error al iniciar sesión con Google.",
      );
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    tipo_usuario: string,
    rol: string,
    affiliateCode: string | undefined,
    acceptedTerms: boolean,
  ) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await apiClient.post("/users/register", {
        nombre: name,
        email: normalizedEmail,
        password,
        tipo_usuario,
        rol,
        affiliateCode,
        acceptedTerms,
      });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        apiClient.defaults.headers.Authorization = `Bearer ${res.data.token}`;
      }
      await fetchUser();
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.response?.data?.message || error.message || "Error en el registro.");
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/users/logout");
    } finally {
      localStorage.removeItem("token");
      delete apiClient.defaults.headers.Authorization;
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
