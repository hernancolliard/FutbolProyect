import Link from "next/link";
import {
  Box,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const seoLinks = [
  {
    href: "/perfiles-jugadores-futbol",
    label: "Perfiles de futbolistas",
  },
  {
    href: "/all-offers",
    label: "Oportunidades y ofertas de fútbol",
  },
  {
    href: "/empleo-entrenadores-futbol",
    label: "Ofertas para entrenadores",
  },
  {
    href: "/trabajo-analista-datos-futbol",
    label: "Trabajo para analistas de fútbol",
  },
  {
    href: "/perfiles",
    label: "Buscar jugadores y profesionales",
  },
  {
    href: "/create-offer",
    label: "Publicar una oferta",
  },
];

export default function HomeSeoOverview() {
  return (
    <Box component="section" aria-labelledby="home-seo-overview-title">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          border: "1px solid #dfe6ef",
          borderRadius: 2.5,
          bgcolor: "#fff",
        }}
      >
        <Typography
          id="home-seo-overview-title"
          component="h2"
          sx={{
            color: "#0a1930",
            fontSize: { xs: "1.55rem", md: "1.9rem" },
            fontWeight: 900,
          }}
        >
          Perfiles y oportunidades para profesionales del fútbol
        </Typography>
        <Typography
          sx={{ mt: 1.2, maxWidth: 900, color: "#5e6c81", lineHeight: 1.7 }}
        >
          En FutbolProyect, futbolistas, entrenadores, scouts y analistas de
          fútbol pueden crear un perfil deportivo con su trayectoria, fotos,
          videos y datos profesionales. La plataforma facilita conexiones con
          clubes, agencias y representantes que buscan talento para sus
          proyectos.
        </Typography>
        <Typography
          sx={{ mt: 1, maxWidth: 900, color: "#5e6c81", lineHeight: 1.7 }}
        >
          Explorá perfiles de jugadores, encontrá ofertas para profesionales
          del fútbol o publicá una oportunidad para llegar a candidatos con
          experiencia y material deportivo.
        </Typography>
        <Stack
          component="nav"
          aria-label="Enlaces a perfiles y oportunidades de fútbol"
          direction="row"
          useFlexGap
          flexWrap="wrap"
          gap={1}
          sx={{ mt: 2.2 }}
        >
          {seoLinks.map((link) => (
            <MuiLink
              key={link.href}
              component={Link}
              href={link.href}
              underline="none"
              sx={{
                px: 1.4,
                py: 0.8,
                border: "1px solid #cbd9eb",
                borderRadius: 1.5,
                color: "#1557ad",
                fontSize: ".86rem",
                fontWeight: 800,
                "&:hover": {
                  borderColor: "#1262db",
                  bgcolor: "#edf5ff",
                },
              }}
            >
              {link.label}
            </MuiLink>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
