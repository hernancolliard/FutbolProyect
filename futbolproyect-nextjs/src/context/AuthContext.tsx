"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/users/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/users/login", { email, password });
    // store token if returned
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    await fetchUser();
  };

  const loginWithGoogle = async (token: string) => {
    const res = await apiClient.post("/users/google-login", { token });
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    await fetchUser();
  };

  const logout = async () => {
    await apiClient.post("/users/logout");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
