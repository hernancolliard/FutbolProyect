"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    questionKey: "home_faq_1_q",
    answerKey: "home_faq_1_a",
    fallbackQuestion: "Quien puede crear un perfil en FutbolProyect?",
    fallbackAnswer:
      "Jugadores, entrenadores, analistas, scouts y otros profesionales vinculados al futbol pueden crear su perfil.",
  },
  {
    questionKey: "home_faq_2_q",
    answerKey: "home_faq_2_a",
    fallbackQuestion: "Quien puede publicar ofertas?",
    fallbackAnswer:
      "Clubes, agencias y scouts pueden registrarse como ofertantes para publicar oportunidades y gestionar postulaciones.",
  },
  {
    questionKey: "home_faq_3_q",
    answerKey: "home_faq_3_a",
    fallbackQuestion: "Como ayuda la plataforma a encontrar talento?",
    fallbackAnswer:
      "Centraliza perfiles, experiencia, videos, datos deportivos y contacto para que la busqueda sea mas ordenada.",
  },
  {
    questionKey: "home_faq_4_q",
    answerKey: "home_faq_4_a",
    fallbackQuestion: "FutbolProyect es solo para jugadores?",
    fallbackAnswer:
      "No. Tambien esta pensada para entrenadores, analistas, scouts, clubes, agencias y academias.",
  },
];

function HomeFAQ() {
  const { t } = useTranslation("common");

  return (
    <Box
      component="section"
      sx={{
        maxWidth: 900,
        mx: "auto",
        my: { xs: 4, md: 6 },
        px: { xs: 2, md: 1 },
      }}
    >
      <Typography variant="h4" component="h2" sx={{ fontWeight: 900, textAlign: "center", mb: 1 }}>
        {t("home_faq_title", "Preguntas frecuentes")}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
        {t(
          "home_faq_subtitle",
          "Respuestas rapidas para usuarios que llegan por primera vez a la plataforma.",
        )}
      </Typography>

      {faqs.map((faq) => (
        <Accordion key={faq.questionKey} disableGutters sx={{ mb: 1, borderRadius: 1, overflow: "hidden" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 800 }}>
              {t(faq.questionKey, faq.fallbackQuestion)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">
              {t(faq.answerKey, faq.fallbackAnswer)}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

export default HomeFAQ;
