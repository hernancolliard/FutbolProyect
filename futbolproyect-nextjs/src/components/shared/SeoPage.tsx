"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Stack,
} from "@mui/material";

interface SeoPageProps {
  h1: string;
  mainText?: string;
  h2?: string;
  ctaText?: string;
  ctaLink?: string;
  children?: React.ReactNode;
  internalLinks?: { href: string; label: string }[];
}

const SeoPage = ({
  h1,
  mainText,
  h2,
  ctaText,
  ctaLink,
  children,
  internalLinks = [],
}: SeoPageProps) => {
  const { t } = useTranslation("common");
  const paragraphs = (mainText || "").split("\n\n");

  return (
    <Box sx={{ bgcolor: "#f7f9fc", minHeight: "100vh", pb: { xs: 7, md: 10 } }}>
      <Box
        component="section"
        sx={{
          py: { xs: 5, md: 7 },
          color: "#fff",
          backgroundImage:
            "linear-gradient(90deg, rgba(2, 15, 37, .97), rgba(3, 31, 70, .88)), url('/images/estadio-futbol.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg">
        <Typography
          component="h1"
          sx={{
            maxWidth: 900,
            color: "#fff",
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.1,
            letterSpacing: "-0.035em",
            fontWeight: 900,
          }}
        >
          {h1}
        </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
        <Paper
          component="section"
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: "1px solid #dfe6ef",
            borderRadius: 2.5,
          }}
        >
        {paragraphs.map((paragraph, index) => (
          <Typography
            variant="body1"
            paragraph
            key={index}
            sx={{ color: "#4d5d73", lineHeight: 1.75 }}
          >
            {paragraph}
          </Typography>
        ))}

        {h2 && (
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mt: 4,
              mb: 2,
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#0a1930",
            }}
          >
            {h2}
          </Typography>
        )}
        {internalLinks.length > 0 && (
          <Stack
            component="nav"
            aria-label={t("related_links", "Enlaces relacionados")}
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={1}
            sx={{ mt: 2.5 }}
          >
            {internalLinks.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                variant="outlined"
                size="small"
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        )}
        </Paper>

      {children && <Box sx={{ mt: 4 }}>{children}</Box>}

      {ctaText && ctaLink && (
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: { xs: 3, md: 4 },
            textAlign: "center",
            color: "#fff",
            borderRadius: 2.5,
            background: "linear-gradient(115deg, #061831, #0a3269)",
          }}
        >
          <Typography component="h2" sx={{ mb: 2, color: "#fff", fontSize: "1.35rem", fontWeight: 900 }}>
            {t(
              "seo_page_cta_title",
              "Da el próximo paso en tu carrera o proyecto deportivo",
            )}
          </Typography>
          <Button
            component={Link}
            variant="contained"
            href={ctaLink}
            size="large"
            sx={{ bgcolor: "#1262db", fontWeight: 900 }}
          >
            {ctaText}
          </Button>
        </Paper>
      )}
      </Container>
    </Box>
  );
};

export default SeoPage;
