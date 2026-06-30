"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import { useTranslation } from "react-i18next";

export type HomeMetric = {
  label: string;
  value: number | string;
};

type HeroProps = {
  metrics: HomeMetric[];
};

const metricIcons = [
  <WorkOutlineRoundedIcon key="offers" />,
  <GroupsOutlinedIcon key="profiles" />,
  <PublicOutlinedIcon key="locations" />,
  <UpdateRoundedIcon key="roles" />,
];

export default function Hero({ metrics }: HeroProps) {
  const { t } = useTranslation("common");
  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      aria-describedby="home-hero-description"
      sx={{
        position: "relative",
        minHeight: { xs: 650, md: 570 },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        color: "#fff",
        pb: { xs: 16, md: 8 },
        bgcolor: "#06142c",
        "& > img": {
          objectPosition: { xs: "62% center", md: "center" },
        },
      }}
    >
      <Image
        src="/images/jugador-estadio-futbol.webp"
        alt="Futbolista en un estadio representando oportunidades profesionales"
        fill
        priority
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
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ maxWidth: { xs: "100%", md: 580 }, position: "relative", zIndex: 1 }}>
          <Typography
            id="home-hero-title"
            component="h1"
            sx={{
              color: "#fff",
              fontSize: { xs: "2.65rem", sm: "3.4rem", md: "4.2rem" },
              lineHeight: 0.98,
              letterSpacing: "-0.05em",
              fontWeight: 900,
            }}
          >
            Mostrá tu fútbol.
            <br />
            <Box component="span" sx={{ color: "#2f80ff" }}>
              Conectá con nuevas oportunidades.
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

      <Container
        maxWidth="lg"
        sx={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translate(-50%, 50%)",
          width: "100%",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            color: "#fff",
            bgcolor: "#071a38",
            border: "1px solid rgba(74, 142, 232, .24)",
            borderRadius: 2.5,
            boxShadow: "0 16px 45px rgba(3, 17, 39, .28)",
            overflow: "hidden",
          }}
        >
          {metrics.map((metric, index) => (
            <Stack
              key={metric.label}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                px: { xs: 1.5, md: 3 },
                py: { xs: 1.7, md: 2.3 },
                borderRight: {
                  xs: index % 2 === 0 ? "1px solid rgba(255,255,255,.1)" : 0,
                  md: index < 3 ? "1px solid rgba(255,255,255,.1)" : 0,
                },
                borderBottom: {
                  xs: index < 2 ? "1px solid rgba(255,255,255,.1)" : 0,
                  md: 0,
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: "rgba(18, 98, 219, .18)",
                  color: "#4b95ff",
                }}
              >
                {metricIcons[index]}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "1.1rem" }}>
                  {metric.value}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,.65)" }}>
                  {metric.label}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
