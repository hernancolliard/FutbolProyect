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
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import { useTranslation } from "react-i18next";

const benefits = [
  {
    key: "home_hero_benefit_profile",
    icon: PersonOutlineRoundedIcon,
  },
  {
    key: "home_hero_benefit_applications",
    icon: SendRoundedIcon,
  },
  {
    key: "home_hero_benefit_contact",
    icon: ContactMailOutlinedIcon,
  },
];

export default function Hero() {
  const { t } = useTranslation("common");

  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      aria-describedby="home-hero-description"
      sx={{
        position: "relative",
        minHeight: { xs: 700, sm: 650, md: 630 },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        color: "#fff",
        bgcolor: "#06142c",
        "& > img": {
          objectPosition: { xs: "64% center", md: "center" },
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
          background: {
            xs: "linear-gradient(90deg, rgba(2, 11, 28, .98) 0%, rgba(2, 17, 39, .86) 64%, rgba(2, 17, 39, .52) 100%)",
            md: "linear-gradient(90deg, rgba(2, 11, 28, .98) 0%, rgba(2, 17, 39, .82) 46%, rgba(2, 17, 39, .2) 78%)",
          },
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(0deg, rgba(2, 11, 28, .72) 0%, transparent 42%)",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 5.5, sm: 7, md: 8 },
        }}
      >
        <Box sx={{ maxWidth: { xs: "100%", md: 740 } }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <SportsSoccerOutlinedIcon sx={{ color: "#5aa2ff", fontSize: 21 }} />
            <Typography
              component="p"
              sx={{
                color: "#b9d7ff",
                fontSize: { xs: ".75rem", sm: ".8rem" },
                fontWeight: 900,
                letterSpacing: ".09em",
                textTransform: "uppercase",
              }}
            >
              {t("home_hero_kicker")}
            </Typography>
          </Stack>

          <Typography
            id="home-hero-title"
            component="h1"
            sx={{
              maxWidth: 720,
              color: "#fff",
              fontSize: { xs: "2.35rem", sm: "3.45rem", md: "4.25rem" },
              lineHeight: { xs: 1.03, md: 0.98 },
              letterSpacing: "-.05em",
              fontWeight: 900,
            }}
          >
            {t("home_hero_title_primary")}{" "}
            <Box component="span" sx={{ color: "#5aa2ff" }}>
              {t("home_hero_title_secondary")}
            </Box>
          </Typography>

          <Typography
            id="home-hero-description"
            sx={{
              mt: 2.3,
              maxWidth: 650,
              color: "rgba(255,255,255,.82)",
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.65,
            }}
          >
            {t("home_hero_description")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.3}
            sx={{ mt: 3.2 }}
          >
            <Button
              component={Link}
              href="/register"
              prefetch={false}
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                minHeight: 48,
                px: 2.7,
                bgcolor: "#1262db",
                fontWeight: 900,
                boxShadow: "0 12px 30px rgba(18, 98, 219, .28)",
                "&:hover": { bgcolor: "#0d4faf" },
              }}
            >
              {t("home_hero_create_profile_cta")}
            </Button>
            <Button
              component={Link}
              href="/all-offers"
              prefetch={false}
              variant="outlined"
              sx={{
                minHeight: 48,
                px: 2.7,
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
              {t("home_hero_explore_offers_cta")}
            </Button>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            gap={0.8}
            sx={{ mt: 2 }}
          >
            <GroupsOutlinedIcon sx={{ color: "#8dbdff", fontSize: 19 }} />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.72)" }}>
              {t("home_hero_recruiter_prompt")}
            </Typography>
            <Typography
              component={Link}
              href="/perfiles"
              sx={{
                color: "#fff",
                fontSize: ".875rem",
                fontWeight: 900,
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                "&:hover": { color: "#8dbdff" },
              }}
            >
              {t("home_hero_recruiter_cta")}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1,
              mt: { xs: 3.2, sm: 4 },
              maxWidth: 740,
              p: 1,
              border: "1px solid rgba(255,255,255,.13)",
              borderRadius: 2.5,
              bgcolor: "rgba(5, 20, 45, .56)",
              backdropFilter: "blur(9px)",
            }}
          >
            {benefits.map(({ key, icon: Icon }) => (
              <Stack
                key={key}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  minHeight: { xs: 42, sm: 58 },
                  px: 1.2,
                  py: { xs: 0.5, sm: 0.8 },
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,.045)",
                }}
              >
                <Icon sx={{ flex: "0 0 auto", color: "#5aa2ff", fontSize: 21 }} />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,.84)", lineHeight: 1.35 }}
                >
                  {t(key)}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
