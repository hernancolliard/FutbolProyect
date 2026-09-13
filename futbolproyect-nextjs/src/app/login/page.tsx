"use client";

import React, { Suspense } from "react";
import { Box, Paper } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import Login from "@/components/auth/Login";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo") || "/";
  const returnTo =
    requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/";

  return (
    <Box sx={{ minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center", p: 2, bgcolor: "#f5f8fc" }}>
      <Paper elevation={0} sx={{ position: "relative", width: "100%", maxWidth: 480, border: "1px solid #dfe6ef", borderRadius: 3, boxShadow: "0 18px 45px rgba(8,34,70,.1)" }}>
        <Login
          onClose={() => router.push(returnTo)}
          onGoogleRegistration={() => router.push("/profile")}
          showCloseButton={false}
        />
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
