"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      console.error(`Auth Error: ${error}`);
    }
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Error de Autenticación</h1>
      <p>Ha ocurrido un error durante el proceso de inicio de sesión.</p>
      {error && (
        <p>
          <strong>Detalles:</strong> {error}
        </p>
      )}
      <a href="/">Volver al inicio</a>
    </div>
  );
}
