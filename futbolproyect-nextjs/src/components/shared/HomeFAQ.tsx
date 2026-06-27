"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const faqs = [
  {
    questionKey: "home_faq_1_q",
    answerKey: "home_faq_1_a",
    fallbackQuestion: "¿Quién puede crear un perfil en FutbolProyect?",
    fallbackAnswer:
      "Jugadores, entrenadores, analistas, scouts y otros profesionales vinculados al fútbol pueden crear su perfil.",
  },
  {
    questionKey: "home_faq_2_q",
    answerKey: "home_faq_2_a",
    fallbackQuestion: "¿Quién puede publicar ofertas?",
    fallbackAnswer:
      "Clubes, agencias y scouts pueden registrarse como ofertantes para publicar oportunidades y gestionar postulaciones.",
  },
  {
    questionKey: "home_faq_3_q",
    answerKey: "home_faq_3_a",
    fallbackQuestion: "¿Cómo ayuda la plataforma a encontrar talento?",
    fallbackAnswer:
      "Centraliza perfiles, experiencia, videos, datos deportivos y contacto para facilitar búsquedas profesionales.",
  },
  {
    questionKey: "home_faq_4_q",
    answerKey: "home_faq_4_a",
    fallbackQuestion: "¿FutbolProyect es solo para jugadores?",
    fallbackAnswer:
      "No. También está pensada para entrenadores, analistas, scouts, preparadores, clubes, agencias y academias.",
  },
];

export default function HomeFAQ() {
  const { t } = useTranslation("common");

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        p: { xs: 2.5, md: 3.5 },
        bgcolor: "#fff",
        border: "1px solid #e1e8f1",
        borderRadius: 2.8,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Chip
          icon={<HelpOutlineRoundedIcon />}
          label="Centro de ayuda"
          sx={{ bgcolor: "#edf5ff", color: "#1262db", fontWeight: 800 }}
        />
        <Typography
          component="h2"
          sx={{
            mt: 1.4,
            color: "#0a1930",
            fontSize: { xs: "1.75rem", md: "2.15rem" },
            fontWeight: 900,
          }}
        >
          {t("home_faq_title", "Preguntas frecuentes")}
        </Typography>
        <Typography sx={{ mt: 0.7, color: "#65738a" }}>
          {t(
            "home_faq_subtitle",
            "Respuestas claras para empezar a usar FutbolProyect.",
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.2,
          alignItems: "start",
        }}
      >
        {faqs.map((faq) => (
          <Accordion
            key={faq.questionKey}
            disableGutters
            elevation={0}
            sx={{
              m: "0 !important",
              minWidth: 0,
              border: "1px solid #dfe6ef",
              borderRadius: "12px !important",
              overflow: "hidden",
              "&:before": { display: "none" },
              "&.Mui-expanded": {
                borderColor: "#a7c6ee",
                boxShadow: "0 8px 24px rgba(8, 34, 70, .06)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<AddRoundedIcon />}
              sx={{
                minHeight: 54,
                px: 2,
                "&.Mui-expanded": { minHeight: 54 },
                "& .MuiAccordionSummary-content": { my: 1.2 },
                "& .MuiAccordionSummary-content.Mui-expanded": { my: 1.2 },
                "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                  transform: "rotate(45deg)",
                },
              }}
            >
              <Typography sx={{ color: "#0a1930", fontSize: ".92rem", fontWeight: 800 }}>
                {t(faq.questionKey, faq.fallbackQuestion)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <Typography variant="body2" sx={{ color: "#65738a", lineHeight: 1.65 }}>
                {t(faq.answerKey, faq.fallbackAnswer)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
