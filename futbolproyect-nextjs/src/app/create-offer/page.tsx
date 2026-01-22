"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import CreateOffer from "@/components/CreateOffer";

export default function CreateOfferPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (user.rol !== "OFERTANTE") {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.rol !== "OFERTANTE") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Crear oferta
      </Typography>

      <CreateOffer />
    </Box>
  );
}
