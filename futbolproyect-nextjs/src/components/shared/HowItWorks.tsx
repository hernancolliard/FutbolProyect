"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ConnectWithoutContactOutlinedIcon from "@mui/icons-material/ConnectWithoutContactOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useTranslation } from "react-i18next";

const steps = [
  {
    icon: <PersonAddAltOutlinedIcon />,
    titleKey: "home_how_step_1_title",
    textKey: "home_how_step_1_text",
  },
  {
    icon: <CloudUploadOutlinedIcon />,
    titleKey: "home_how_step_2_title",
    textKey: "home_how_step_2_text",
  },
  {
    icon: <ConnectWithoutContactOutlinedIcon />,
    titleKey: "home_how_step_3_title",
    textKey: "home_how_step_3_text",
  },
  {
    icon: <HandshakeOutlinedIcon />,
    titleKey: "home_how_step_4_title",
    textKey: "home_how_step_4_text",
  },
];

export default function HowItWorks() {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      sx={{
        p: { xs: 2, md: 3.5 },
        color: "#fff",
        borderRadius: 2.5,
        background: "linear-gradient(115deg, #061831, #0a3269)",
        boxShadow: "0 16px 35px rgba(4, 25, 55, .15)",
      }}
    >
      <Typography
        component="h2"
        sx={{ mb: 2.5, color: "#fff", textAlign: "center", fontSize: "1.55rem", fontWeight: 900 }}
      >
        {t("home_how_title")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(7, auto)" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 2.5, md: 1.2 },
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.titleKey}>
            <Stack alignItems="center" sx={{ maxWidth: 210, mx: "auto", textAlign: "center" }}>
              <Box
                sx={{
                  width: { xs: 52, md: 62 },
                  height: { xs: 52, md: 62 },
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  border: "1px solid rgba(78, 151, 255, .7)",
                  color: "#62a8ff",
                  "& svg": { fontSize: { xs: 27, md: 31 } },
                }}
              >
                {step.icon}
              </Box>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1.3 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    bgcolor: "#1262db",
                    fontSize: ".7rem",
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: ".9rem" }}>
                  {t(step.titleKey)}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ mt: 0.7, color: "rgba(255,255,255,.72)", fontSize: { xs: ".78rem", md: ".75rem" }, lineHeight: 1.45 }}>
                {t(step.textKey)}
              </Typography>
            </Stack>
            {index < steps.length - 1 && (
              <ArrowForwardRoundedIcon
                sx={{
                  display: { xs: "none", md: "block" },
                  color: "rgba(255,255,255,.45)",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
