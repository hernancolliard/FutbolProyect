"use client";

import React from "react";
import { Box, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import Login from "@/components/auth/Login";

export default function LoginPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#f5f8fc" }}>
      <Paper elevation={0} sx={{ position: "relative", width: "100%", maxWidth: 480, border: "1px solid #dfe6ef", borderRadius: 3, boxShadow: "0 18px 45px rgba(8,34,70,.1)" }}>
        <Login onClose={() => router.push("/")} showCloseButton={false} />
      </Paper>
    </Box>
  );
}
