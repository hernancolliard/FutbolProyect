"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { Offer, Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { getOfferPath, getProfilePath } from "@/lib/seoSlugs";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href: string;
  action: string;
};

function SectionHeader({ title, subtitle, href, action }: SectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "flex-end" }}
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Box>
        <Typography
          component="h2"
          sx={{ color: "#0a1930", fontSize: "1.4rem", fontWeight: 900 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.4, color: "#65738a" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Button
        component={Link}
        href={href}
        size="small"
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{ color: "#1262db", fontWeight: 900, whiteSpace: "nowrap" }}
      >
        {action}
      </Button>
    </Stack>
  );
}

export function HomeOffersShowcase({ offers }: { offers: Offer[] }) {
  const { t, i18n } = useTranslation("common");
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const localizedField = (offer: Offer, field: string) =>
    (offer as any)[`${field}_${language}`] || (offer as any)[field] || "";
  if (!offers.length) return null;

  return (
    <Box component="section">
      <SectionHeader
        title={t("home_latest_offers")}
        href="/all-offers"
        action={t("view_all_offers")}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {offers.slice(0, 5).map((offer) => (
          <Paper
            key={offer.id}
            elevation={0}
            sx={{
              p: 1.7,
              minHeight: 255,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #dfe6ef",
              borderRadius: 2.2,
              transition: "transform 180ms ease, box-shadow 180ms ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 14px 30px rgba(8, 34, 70, .09)",
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Chip
                label={localizedField(offer, "nivel") || t("offer")}
                size="small"
                sx={{ bgcolor: "#edf5ff", color: "#1557ad", fontWeight: 800 }}
              />
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1.5,
                  bgcolor: "#f4f6f9",
                }}
              >
                <Image
                  src={offer.imagen_url || "/images/logos/logofpazul.webp"}
                  alt=""
                  width={44}
                  height={44}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "contain",
                    opacity: offer.imagen_url ? 1 : 0.25,
                  }}
                />
              </Box>
            </Stack>
            <Typography
              sx={{
                mt: 1.2,
                color: "#0a1930",
                fontSize: ".92rem",
                lineHeight: 1.35,
                fontWeight: 900,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {localizedField(offer, "titulo")}
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1.2 }}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <BadgeOutlinedIcon sx={{ fontSize: 15, color: "#52709a" }} />
                <Typography variant="caption" sx={{ color: "#65738a" }} noWrap>
                  {localizedField(offer, "puesto") || t("position_not_specified")}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <PlaceOutlinedIcon sx={{ fontSize: 15, color: "#52709a" }} />
                <Typography variant="caption" sx={{ color: "#65738a" }} noWrap>
                  {localizedField(offer, "ubicacion") || t("location_not_specified")}
                </Typography>
              </Stack>
            </Stack>
            <Button
              component={Link}
              href={getOfferPath(offer)}
              variant="outlined"
              size="small"
              sx={{ mt: "auto", alignSelf: "flex-start", fontWeight: 900 }}
            >
              {t("view_offer")}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export function HomeProfilesShowcase({ profiles }: { profiles: Profile[] }) {
  const { t } = useTranslation("common");
  if (!profiles.length) return null;

  return (
    <Box component="section">
      <SectionHeader
        title={t("home_featured_profiles")}
        subtitle={t("home_featured_profiles_text")}
        href="/perfiles"
        action={t("view_all_profiles")}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {profiles.slice(0, 5).map((profile) => {
          const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
          return (
            <Paper
              key={profile.id}
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid #dfe6ef",
                borderRadius: 2.2,
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 30px rgba(8, 34, 70, .09)",
                },
              }}
            >
              <Box
                component={Link}
                href={getProfilePath(profile)}
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: { xs: 180, sm: 160, md: 135 },
                  bgcolor: "#eaf0f7",
                  aspectRatio: "220 / 150",
                  overflow: "hidden"
                }}
              >
                <Image
                  src={profile.foto_perfil_url || "/images/logos/logofpazul.webp"}
                  alt={
                    fullName
                      ? t("profile_image_alt", { name: fullName })
                      : t("sports_profile_on_futbolproyect")
                  }
                  width={220}
                  height={150}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: profile.foto_perfil_url ? "cover" : "contain",
                    objectPosition: "center",
                    padding: profile.foto_perfil_url ? 0 : 38,
                    opacity: profile.foto_perfil_url ? 1 : 0.25,
                  }}
                />
              </Box>
              <Stack sx={{ p: 1.6, minHeight: 150 }}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography sx={{ color: "#0a1930", fontWeight: 900, fontSize: ".9rem" }} noWrap>
                    {fullName || t("profile")}
                  </Typography>
                  {Number(profile.average_rating) > 0 && (
                    <Typography variant="caption" sx={{ color: "#966200", fontWeight: 800 }}>
                      ★ {Number(profile.average_rating).toFixed(1)}
                    </Typography>
                  )}
                </Stack>
                <Chip
                  label={profile.posicion_principal || t("professional")}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1, alignSelf: "flex-start", maxWidth: "100%" }}
                />
                <Typography variant="caption" sx={{ mt: 0.8, color: "#65738a" }} noWrap>
                  {profile.nacionalidad || t("nationality_not_specified")}
                </Typography>
                <Button
                  component={Link}
                  href={getProfilePath(profile)}
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: "auto", px: 0, alignSelf: "flex-start", fontWeight: 900 }}
                >
                  {t("view_profile")}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
