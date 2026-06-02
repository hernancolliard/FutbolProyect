"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import Divider from "@mui/material/Divider"; // Importamos Divider

function Footer() {
  const { t } = useTranslation("common");

  // Definimos los enlaces SEO aquí para mantener el código limpio
  const seoLinks = [
    { href: "/ofertas-trabajo-futbol", label: "Trabajos de Fútbol" },
    { href: "/empleo-entrenadores-futbol", label: "Empleo Entrenadores" },
    { href: "/trabajo-analista-datos-futbol", label: "Analista de Datos" },
    { href: "/perfiles-jugadores-futbol", label: "Perfiles de Jugadores" },
  ];

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "primary.main", color: "white", py: 4, mt: 6 }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        sx={{ maxWidth: "lg", mx: "auto", px: 2 }}
      >
        {/* SECCIÓN 1: Enlaces SEO (Lo nuevo) */}
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography
            variant="subtitle2"
            sx={{
              opacity: 0.8,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Explorar Oportunidades
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 2, md: 4 }}
            flexWrap="wrap"
            justifyContent="center"
            useFlexGap
          >
            {seoLinks.map((link) => (
              <MuiLink
                key={link.href}
                component={Link}
                href={link.href}
                color="inherit"
                underline="hover"
                variant="body2"
                sx={{ py: 0.5 }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ width: "50%", borderColor: "rgba(255,255,255,0.2)" }} />

        {/* SECCIÓN 2: Legales y Copyright */}
        <Stack spacing={1} alignItems="center">
          <Typography variant="body2" color="inherit">
            &copy; 2025 FutbolProyect.{" "}
            {t("all_rights_reserved", "Todos los derechos reservados.")}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flexWrap: "wrap", justifyContent: "center" }}
          >
            <MuiLink
              component={Link}
              href="/privacy"
              color="inherit"
              underline="hover"
            >
              {t("privacy_policy", "Política de Privacidad")}
            </MuiLink>
            <Typography variant="body2" color="inherit">
              |
            </Typography>
            <MuiLink
              component={Link}
              href="/terms"
              color="inherit"
              underline="hover"
            >
              {t("terms_of_service", "Términos de Servicio")}
            </MuiLink>
          </Stack>
        </Stack>

        {/* SECCIÓN 3: Redes Sociales */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", justifyContent: "center" }}
        >
          <IconButton
            component={MuiLink}
            href="https://www.facebook.com/profile.php?id=61583277031848"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/facebook.png"
              alt="Facebook"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/twitter.png"
              alt="Twitter"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://www.instagram.com/futbol.proyect/#"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/instagram.png"
              alt="Instagram"
              width={24}
              height={24}
            />
          </IconButton>
          <IconButton
            component={MuiLink}
            href="https://www.linkedin.com/company/109604115/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <Image
              src="/images/logos/linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
            />
          </IconButton>
        </Stack>

        {/* SECCIÓN 4: Developer */}
        <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
          <MuiLink
            href="https://parana-dev.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
          >
            Parana Dev - Desarrollo Web
          </MuiLink>
        </Typography>
      </Stack>
    </Box>
  );
}

export default Footer;
