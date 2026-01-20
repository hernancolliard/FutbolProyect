'use client';

import AdminDashboard from "@/components/AdminDashboard";
import AdminRoute from "@/components/AdminRoute";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

export default function AdminPage() {
  const { t } = useTranslation();

  return (
    <AdminRoute>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          {t('admin_dashboard_title', 'Panel de Administración')}
        </Typography>
        <AdminDashboard />
      </Box>
    </AdminRoute>
  );
}
