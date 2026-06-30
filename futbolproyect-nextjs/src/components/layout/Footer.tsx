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
import { useTranslation } from "react-i18next";

const navigationLinks = [
  { href: "/", key: "home" },
  { href: "/all-offers", key: "offers" },
  { href: "/perfiles", key: "all_profiles" },
  { href: "/blog", key: "blog" },
  { href: "/publicidad", key: "advertising_label" },
  { href: "/suscripcion", key: "subscriptions" },
];

const legalLinks = [
  { href: "/terms", key: "terms_of_service" },
  { href: "/privacy", key: "privacy_policy" },
  { href: "/contact", key: "contact" },
];

const opportunityLinks = [
  { href: "/ofertas/futbolistas", key: "footer_football_jobs" },
  { href: "/ofertas/entrenadores", key: "footer_coach_jobs" },
  { href: "/ofertas/analistas-de-futbol", key: "footer_data_analysts" },
  { href: "/perfiles/jugadores", key: "footer_player_profiles" },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/profile.php?id=61583277031848",
    label: "Facebook",
    image: "/images/logos/facebook.webp",
  },
  {
    href: "https://twitter.com",
    label: "Twitter",
    image: "/images/logos/twitter.webp",
  },
  {
    href: "https://www.instagram.com/futbol.proyect/#",
    label: "Instagram",
    image: "/images/logos/instagram.webp",
  },
  {
    href: "https://www.linkedin.com/company/109604115/",
    label: "LinkedIn",
    image: "/images/logos/linkedin.webp",
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
  const { t } = useTranslation("common");
  const translatedNavigationLinks = navigationLinks.map((link) => ({ ...link, label: t(link.key) }));
  const translatedLegalLinks = legalLinks.map((link) => ({ ...link, label: t(link.key) }));
  const translatedOpportunityLinks = opportunityLinks.map((link) => ({ ...link, label: t(link.key) }));
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
              src="/images/logos/logofpblanco.webp"
              alt="FutbolProyect"
              width={125}
              height={66}
              style={{ width: 112, height: "auto", objectFit: "contain" }}
            />
            <Typography
              variant="body2"
              sx={{ mt: 1.2, maxWidth: 260, color: "rgba(255,255,255,.62)", lineHeight: 1.6 }}
            >
              {t("footer_tagline")}
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

          <FooterColumn title={t("footer_navigation")} links={translatedNavigationLinks} />
          <FooterColumn title={t("footer_legal")} links={translatedLegalLinks} />
          <FooterColumn title={t("footer_opportunities")} links={translatedOpportunityLinks} />

          <Box>
            <Typography sx={{ color: "#fff", fontSize: ".9rem", fontWeight: 900 }}>
              {t("contact")}
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
                {t("footer_send_inquiry")}
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
            © 2026 FutbolProyect. {t("all_rights_reserved")}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,.42)" }}>
            {t("footer_web_development_by")}{" "}
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
