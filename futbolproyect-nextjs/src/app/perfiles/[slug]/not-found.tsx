"use client";

import { Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function ProfileNotFound() {
  const { t } = useTranslation("common");
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("profile_not_found")}
      </Typography>
      <Typography>
        {t("profile_not_found_help")}
      </Typography>
    </Box>
  );
}
