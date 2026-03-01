"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import publicApi from "@/lib/publicApi";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token inválido o ausente");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // forzamos el prefijo /api por si el baseURL no está bien configurado
      await publicApi.post("/api/users/reset-password", {
        token,
        newPassword: password,
      });

      setSuccess("Contraseña actualizada correctamente");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
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
