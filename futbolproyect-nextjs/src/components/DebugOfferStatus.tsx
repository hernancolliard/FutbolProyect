"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export default function DebugOfferStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/offers/debug/user-status");
      setStatus(response.data);
      console.log("User status:", response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card sx={{ m: 2, p: 2, bgcolor: "#f5f5f5" }}>
      <CardContent>
        <Typography variant="h6">Debug: Estado del Usuario</Typography>
        <Button 
          variant="contained" 
          onClick={checkStatus} 
          disabled={loading}
          sx={{ my: 2 }}
        >
          {loading ? "Cargando..." : "Verificar Estado"}
        </Button>

        {error && (
          <Box sx={{ color: "red", my: 1 }}>
            <strong>Error:</strong> {error}
          </Box>
        )}

        {status && (
          <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, my: 2 }}>
            <Typography variant="subtitle2">
              <strong>Usuario:</strong>
            </Typography>
            <pre>{JSON.stringify(status.user, null, 2)}</pre>

            <Typography variant="subtitle2">
              <strong>Suscripción:</strong>
            </Typography>
            {status.subscription ? (
              <pre>{JSON.stringify(status.subscription, null, 2)}</pre>
            ) : (
              <Typography color="error">❌ Sin suscripción activa</Typography>
            )}

            <Typography variant="subtitle2">
              <strong>JWT Payload:</strong>
            </Typography>
            <pre>{JSON.stringify(status.jwtPayload, null, 2)}</pre>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
