"use client";

import React from "react";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { PLAYER_POSITION_OPTIONS } from "@/lib/profilePositions";

type Metric = {
  label: string;
  value: number | string;
};

type Props = {
  activePosition: string;
  metrics: Metric[];
  onPositionChange: (position: string) => void;
};

const metricIcons = [
  <GroupsOutlinedIcon key="profiles" />,
  <PublicOutlinedIcon key="nationalities" />,
  <SportsSoccerOutlinedIcon key="positions" />,
  <VerifiedOutlinedIcon key="complete" />,
];

export default function ProfilesHero({
  activePosition,
  metrics,
  onPositionChange,
}: Props) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        color: "#fff",
        pt: { xs: 6, md: 8 },
        pb: { xs: 11, md: 12 },
        backgroundImage:
          "linear-gradient(90deg, rgba(2, 15, 37, .98) 0%, rgba(3, 28, 66, .91) 55%, rgba(3, 21, 48, .82) 100%), url('/images/fondo_1_lowres.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "2.35rem", md: "3.35rem" },
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Perfiles de{" "}
          <Box component="span" sx={{ color: "#2f80ff" }}>
            Fútbol
          </Box>
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 690,
            color: "rgba(255,255,255,.82)",
            fontSize: { xs: ".98rem", md: "1.08rem" },
            lineHeight: 1.65,
          }}
        >
          Descubrí jugadores, talentos emergentes y profesionales disponibles
          para potenciar tu próximo proyecto deportivo.
        </Typography>

        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
          {PLAYER_POSITION_OPTIONS.map((position) => {
            const selected = activePosition === position.value;
            return (
              <Chip
                key={position.value}
                clickable
                label={position.fallback}
                onClick={() =>
                  onPositionChange(selected ? "" : position.value)
                }
                sx={{
                  color: "#fff",
                  border: "1px solid",
                  borderColor: selected ? "#2f80ff" : "rgba(255,255,255,.3)",
                  bgcolor: selected ? "#1262db" : "rgba(255,255,255,.06)",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: selected ? "#1262db" : "rgba(255,255,255,.14)",
                  },
                }}
              />
            );
          })}
        </Stack>
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
            border: "1px solid rgba(9, 42, 83, .1)",
            borderRadius: 2.5,
            boxShadow: "0 14px 40px rgba(5, 25, 55, .12)",
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
                py: { xs: 1.7, md: 2.2 },
                borderRight: {
                  xs: index % 2 === 0 ? "1px solid #e7edf5" : 0,
                  md: index < 3 ? "1px solid #e7edf5" : 0,
                },
                borderBottom: {
                  xs: index < 2 ? "1px solid #e7edf5" : 0,
                  md: 0,
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: "#edf5ff",
                  color: "#1262db",
                  flexShrink: 0,
                }}
              >
                {metricIcons[index]}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ color: "#07162d", fontWeight: 900, fontSize: "1.1rem" }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="caption" sx={{ color: "#5d6b80" }}>
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
