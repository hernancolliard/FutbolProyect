"use client";
export const dynamic = "force-dynamic";

import AdminDashboard from "@/components/AdminDashboard";
import AdminRoute from "@/components/AdminRoute";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <AdminRoute>
      <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
          {t("admin_dashboard_title", "Panel de Administración")}
        </Typography>
        <AdminDashboard />
      </Box>
    </AdminRoute>
  );
}
