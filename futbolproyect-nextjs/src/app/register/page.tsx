"use client";

import React, { Suspense } from "react";
import { Box, Paper } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import Register from "@/components/auth/Register"; // Reutilizamos tu componente existente

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || undefined;

  return (
    <Box sx={{ minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#f5f8fc" }}>
      <Paper elevation={0} sx={{ position: "relative", width: "100%", maxWidth: 560, border: "1px solid #dfe6ef", borderRadius: 3, boxShadow: "0 18px 45px rgba(8,34,70,.1)" }}>
        <Register
          onClose={() => router.push("/")}
          onSwitchToLogin={() => router.push("/login")}
          initialRole={initialRole}
          showCloseButton={false}
        />
      </Paper>
    </Box>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
