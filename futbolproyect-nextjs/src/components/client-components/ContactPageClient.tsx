"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import apiClient from "@/lib/apiClient";
import ContactFormContent from "./ContactFormContent";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

type Props = {
  compact?: boolean;
};

export default function ContactPageClient({ compact = false }: Props) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const reportOfferId = params.get("reportOfferId")?.trim();
    if (!reportOfferId) return;

    const reportOfferTitle = params.get("reportOfferTitle")?.trim();
    const reportMessage = [
      t(
        "report_offer_message_intro",
        "Quiero denunciar una posible estafa o contenido engañoso en una oferta.",
      ),
      "",
      `${t("report_offer_label", "Oferta")}: ${reportOfferTitle || `#FP-${reportOfferId}`}`,
      `ID: #FP-${reportOfferId}`,
      `${t("report_offer_link_label", "Enlace")}: ${window.location.origin}/offers/${reportOfferId}`,
      "",
      t(
        "report_offer_details_prompt",
        "Motivo y detalles de la denuncia: ",
      ),
    ].join("\n");

    setFormData((current) => ({
      name: current.name || user?.nombre || "",
      email: current.email || user?.email || "",
      message: current.message || reportMessage,
    }));
  }, [t, user?.email, user?.nombre]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      await apiClient.post("/contact", formData);
      setFeedback(
        t("contact_success", { name: formData.name }),
      );
      setFormData({ name: "", email: "", message: "" });
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          t("contact_send_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const contactContent = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: compact ? "minmax(0, .8fr) minmax(0, 1.2fr)" : "minmax(0, .85fr) minmax(0, 1.15fr)",
        },
        gap: { xs: 2.5, md: 3.5 },
        alignItems: "stretch",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          minWidth: 0,
          color: "#fff",
          borderRadius: 2.8,
          background: "linear-gradient(145deg, #071a35, #0b3268)",
          boxShadow: "0 16px 38px rgba(4, 25, 55, .18)",
        }}
      >
        <Chip
          icon={<SportsSoccerOutlinedIcon />}
          label={t("contact_help_badge")}
          sx={{
            color: "#fff",
            bgcolor: "rgba(255,255,255,.09)",
            fontWeight: 800,
            "& .MuiChip-icon": { color: "#62a8ff" },
          }}
        />
        <Typography
          component={compact ? "h2" : "h1"}
          sx={{
            mt: 2,
            color: "#fff",
            fontSize: compact
              ? { xs: "1.65rem", md: "2rem" }
              : { xs: "2rem", md: "2.55rem" },
            lineHeight: 1.1,
            fontWeight: 900,
          }}
        >
          {t("contact_heading")}
        </Typography>
        <Typography sx={{ mt: 1.2, color: "rgba(255,255,255,.72)", lineHeight: 1.65 }}>
          {t("contact_intro")}
        </Typography>

        <Stack spacing={1.2} sx={{ mt: 3 }}>
          {[
            { icon: <EmailOutlinedIcon />, text: "info@futbolproyect.com" },
            { icon: <HelpOutlineRoundedIcon />, text: t("contact_general_support") },
            { icon: <BusinessOutlinedIcon />, text: t("contact_business_support") },
          ].map((item) => (
            <Stack key={item.text} direction="row" spacing={1.1} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,.09)",
                  color: "#62a8ff",
                  flexShrink: 0,
                  "& svg": { fontSize: 19 },
                }}
              >
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.82)", overflowWrap: "anywhere" }}>
                {item.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <ContactFormContent
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        feedback={feedback}
        error={error}
        loading={loading}
        compact={compact}
      />
    </Box>
  );

  if (compact) {
    return (
      <Box component="section" id="contact-section">
        {contactContent}
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">{contactContent}</Container>
    </Box>
  );
}
