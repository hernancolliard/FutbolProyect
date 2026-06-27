"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AdBanner from "@/components/ads/AdBanner";

const navigationLinks = [
  { href: "/", label: "Inicio" },
  { href: "/all-offers", label: "Ofertas" },
  { href: "/perfiles", label: "Perfiles" },
  { href: "/publicidad", label: "Publicidad" },
  { href: "/suscripcion", label: "Suscripciones" },
];

const legalLinks = [
  { href: "/terms", label: "Términos de servicio" },
  { href: "/privacy", label: "Política de privacidad" },
  { href: "/contact", label: "Contacto" },
];

const opportunityLinks = [
  { href: "/ofertas-trabajo-futbol", label: "Trabajos de fútbol" },
  { href: "/empleo-entrenadores-futbol", label: "Empleo para entrenadores" },
  { href: "/trabajo-analista-datos-futbol", label: "Analistas de datos" },
  { href: "/perfiles-jugadores-futbol", label: "Perfiles de jugadores" },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/profile.php?id=61583277031848",
    label: "Facebook",
    image: "/images/logos/facebook.png",
  },
  {
    href: "https://twitter.com",
    label: "Twitter",
    image: "/images/logos/twitter.png",
  },
  {
    href: "https://www.instagram.com/futbol.proyect/#",
    label: "Instagram",
    image: "/images/logos/instagram.png",
  },
  {
    href: "https://www.linkedin.com/company/109604115/",
    label: "LinkedIn",
    image: "/images/logos/linkedin.png",
  },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <Box>
      <Typography sx={{ color: "#fff", fontSize: ".9rem", fontWeight: 900 }}>
        {title}
      </Typography>
      <Stack spacing={1.1} sx={{ mt: 1.6 }}>
        {links.map((link) => (
          <MuiLink
            key={link.href}
            component={Link}
            href={link.href}
            underline="none"
            sx={{
              width: "fit-content",
              color: "rgba(255,255,255,.62)",
              fontSize: ".82rem",
              transition: "color 160ms ease",
              "&:hover": { color: "#62a8ff" },
            }}
          >
            {link.label}
          </MuiLink>
        ))}
      </Stack>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 0,
        color: "#fff",
        bgcolor: "#04142d",
        borderTop: "1px solid rgba(72, 131, 210, .2)",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 4.5, md: 5.5 }, pb: 3 }}>
        <AdBanner placement="footer" compact />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "1.35fr .75fr .85fr 1fr .9fr",
            },
            gap: { xs: 3.5, md: 3 },
            alignItems: "start",
          }}
        >
          <Box>
            <Image
              src="/images/logos/logofpblanco.png"
              alt="FutbolProyect"
              width={125}
              height={66}
              style={{ width: 112, height: "auto", objectFit: "contain" }}
            />
            <Typography
              variant="body2"
              sx={{ mt: 1.2, maxWidth: 260, color: "rgba(255,255,255,.62)", lineHeight: 1.6 }}
            >
              Conectando talento y oportunidades dentro del fútbol profesional.
            </Typography>
            <Stack direction="row" spacing={0.7} sx={{ mt: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "rgba(255,255,255,.07)",
                    border: "1px solid rgba(255,255,255,.1)",
                    "&:hover": { bgcolor: "rgba(98,168,255,.18)" },
                  }}
                >
                  <Image src={social.image} alt="" width={18} height={18} />
                </IconButton>
              ))}
            </Stack>
          </Box>

          <FooterColumn title="Navegación" links={navigationLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
          <FooterColumn title="Oportunidades" links={opportunityLinks} />

          <Box>
            <Typography sx={{ color: "#fff", fontSize: ".9rem", fontWeight: 900 }}>
              Contacto
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1.6 }}>
              <Stack direction="row" spacing={0.8} alignItems="flex-start">
                <EmailOutlinedIcon sx={{ mt: 0.1, color: "#62a8ff", fontSize: 18 }} />
                <MuiLink
                  href="mailto:info@futbolproyect.com"
                  underline="none"
                  sx={{ color: "rgba(255,255,255,.68)", fontSize: ".82rem", overflowWrap: "anywhere" }}
                >
                  info@futbolproyect.com
                </MuiLink>
              </Stack>
              <MuiLink
                component={Link}
                href="/contact"
                underline="none"
                sx={{ color: "#62a8ff", fontSize: ".82rem", fontWeight: 800 }}
              >
                Enviar una consulta
              </MuiLink>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3.5, borderColor: "rgba(255,255,255,.1)" }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.48)" }}>
            © 2026 FutbolProyect. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.42)" }}>
            Desarrollo web por{" "}
            <MuiLink
              href="https://parana-dev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: "#62a8ff" }}
            >
              Paraná Dev
            </MuiLink>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
