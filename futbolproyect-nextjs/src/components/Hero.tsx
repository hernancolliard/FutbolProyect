"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      aria-describedby="home-hero-description"
      sx={{
        position: "relative",
        minHeight: { xs: 600, sm: 630, md: 570 },
        display: "flex",
        alignItems: "center",
        overflow: "visible",
        color: "#fff",
        pb: { xs: 6, md: 8 },
        bgcolor: "#06142c",
        "& > img": {
          objectPosition: { xs: "62% center", md: "center" },
        },
      }}
    >
      <Image
        src="/images/estadiohero.webp"
        alt={t("hero_stadium_alt")}
        fill
        priority
        quality={70}
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(90deg, rgba(2, 11, 28, .96) 0%, rgba(2, 17, 39, .7) 42%, rgba(2, 17, 39, .12) 72%)",
        }}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4.5, sm: 6, md: 8 } }}>
        <Box sx={{ maxWidth: { xs: "100%", md: 650 }, position: "relative", zIndex: 1 }}>
          <Typography
            id="home-hero-title"
            component="h1"
            sx={{
              color: "#fff",
              fontSize: { xs: "2.3rem", sm: "3.4rem", md: "4.2rem" },
              lineHeight: 0.98,
              letterSpacing: "-0.05em",
              fontWeight: 900,
            }}
          >
            {t("hero_title_primary", "Mostrá tu talento.")}
            <br />
            <Box component="span" sx={{ color: "#2f80ff" }}>
              {t("hero_title_secondary", "Conectá con nuevas oportunidades.")}
            </Box>
          </Typography>
          <Typography
            id="home-hero-description"
            sx={{
              mt: 2.2,
              maxWidth: 510,
              color: "rgba(255,255,255,.82)",
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.65,
            }}
          >
            {t("new_hero_subtitle")}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.3} sx={{ mt: 3 }}>
            <Button
              component={Link}
              href="/all-offers"
              prefetch={false}
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                px: 2.5,
                py: 1.25,
                bgcolor: "#1262db",
                fontWeight: 900,
                "&:hover": { bgcolor: "#0d4faf" },
              }}
            >
              {t("hero_primary_cta")}
            </Button>
            <Button
              component={Link}
              href="/register"
              prefetch={false}
              variant="outlined"
              sx={{
                px: 2.5,
                py: 1.25,
                color: "#fff",
                borderColor: "rgba(255,255,255,.65)",
                fontWeight: 900,
                "&:hover": {
                  color: "#fff",
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,.08)",
                },
              }}
            >
              {t("home_create_profile_free")}
            </Button>
          </Stack>

          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={2}
            sx={{ mt: 2.5 }}
          >
            {["home_trust_profiles_title", "home_trust_contact_title", "home_trust_global_title"].map(
              (item) => (
                <Stack key={item} direction="row" spacing={0.7} alignItems="center">
                  <CheckCircleOutlineRoundedIcon sx={{ color: "#2f80ff", fontSize: 18 }} />
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,.82)" }}>
                    {t(item)}
                  </Typography>
                </Stack>
              ),
            )}
          </Stack>
        </Box>
      </Container>

    </Box>
  );
}
