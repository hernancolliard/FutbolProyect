"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import apiClient from "@/lib/apiClient";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Token inválido o ausente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.post("/users/reset-password", {
        token, // 🔴 ESTO ES CLAVE
        newPassword: password, // 🔴 NOMBRE EXACTO
      });

      setSuccess("Contraseña actualizada correctamente");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al restablecer la contraseña",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button disabled={loading}>Cambiar contraseña</button>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </form>
  );
}
