"use client";

import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { useTranslation } from "react-i18next";

const trustItems = [
  {
    icon: <VerifiedOutlinedIcon />,
    titleKey: "home_trust_profiles_title",
    textKey: "home_trust_profiles_text",
  },
  {
    icon: <FactCheckOutlinedIcon />,
    titleKey: "home_trust_offers_title",
    textKey: "home_trust_offers_text",
  },
  {
    icon: <SecurityOutlinedIcon />,
    titleKey: "home_trust_contact_title",
    textKey: "home_trust_contact_text",
  },
  {
    icon: <PublicOutlinedIcon />,
    titleKey: "home_trust_global_title",
    textKey: "home_trust_global_text",
  },
];

const networkItems = [
  {
    icon: <HubOutlinedIcon />,
    titleKey: "home_network_professional_title",
    textKey: "home_network_professional_text",
  },
  {
    icon: <PsychologyOutlinedIcon />,
    titleKey: "home_network_opportunities_title",
    textKey: "home_network_opportunities_text",
  },
  {
    icon: <HandshakeOutlinedIcon />,
    titleKey: "home_network_connections_title",
    textKey: "home_network_connections_text",
  },
  {
    icon: <TrendingUpOutlinedIcon />,
    titleKey: "home_network_growth_title",
    textKey: "home_network_growth_text",
  },
];

export default function HomeTrustSignals() {
  const { t } = useTranslation("common");
  return (
    <Box component="section">
      <Typography
        component="h2"
        sx={{ mb: 2, textAlign: "center", color: "#0a1930", fontSize: "1.45rem", fontWeight: 900 }}
      >
        {t("home_trust_title")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        {trustItems.map((item) => (
          <Paper
            key={item.titleKey}
            elevation={0}
            sx={{ p: 2.2, textAlign: "center", border: "1px solid #dfe6ef", borderRadius: 2.3 }}
          >
            <Box sx={{ color: "#1262db", "& svg": { fontSize: 30 } }}>{item.icon}</Box>
            <Typography sx={{ mt: 0.8, color: "#0a1930", fontWeight: 900 }}>
              {t(item.titleKey)}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.6, color: "#65738a", lineHeight: 1.5, display: "block" }}>
              {t(item.textKey)}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          mt: 4,
          pt: 3.5,
          borderTop: "1px solid #e2e8f0",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.25fr repeat(4, 1fr)" },
          gap: 2.5,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ color: "#0a1930", fontSize: "1.2rem", fontWeight: 900 }}>
            {t("home_network_title")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.8, color: "#65738a", lineHeight: 1.55 }}>
            {t("home_network_text")}
          </Typography>
        </Box>
        {networkItems.map((item) => (
          <Stack key={item.titleKey} alignItems="center" sx={{ textAlign: "center" }}>
            <Box sx={{ color: "#315b92", "& svg": { fontSize: 28 } }}>{item.icon}</Box>
            <Typography sx={{ mt: 0.7, color: "#0a1930", fontWeight: 900, fontSize: ".86rem" }}>
              {t(item.titleKey)}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.4, color: "#65738a" }}>
              {t(item.textKey)}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
