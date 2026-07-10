"use client";

import AdminRoute from "@/components/AdminRoute";
import AffiliateManagement from "@/components/AffiliateManagement";
import { Box, Typography } from "@mui/material";

export default function AdminAffiliateCommissionsPage() {
  return (
    <AdminRoute>
      <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 900 }}>
          Comisiones de afiliados
        </Typography>
        <AffiliateManagement />
      </Box>
    </AdminRoute>
  );
}
