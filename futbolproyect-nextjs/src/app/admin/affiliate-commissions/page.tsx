"use client";

import AdminRoute from "@/components/AdminRoute";
import AffiliateManagement from "@/components/AffiliateManagement";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function AdminAffiliateCommissionsPage() {
  const { t } = useTranslation("common");
  return (
    <AdminRoute>
      <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 900 }}>
          {t("affiliate_commissions")}
        </Typography>
        <AffiliateManagement />
      </Box>
    </AdminRoute>
  );
}
