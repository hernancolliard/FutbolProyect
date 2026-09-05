"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  Paper,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useTranslation } from "react-i18next";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { Profile } from "@/lib/types";
import { getProfilePath } from "@/lib/seoSlugs";

interface ProfileCardProps {
  profile: Profile;
}

const getAge = (birthDate?: string) => {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) age -= 1;
  return age >= 0 ? age : null;
};

function ProfileCard({ profile }: ProfileCardProps) {
  const { t } = useTranslation("common");
  const profileImageUrl =
    profile.foto_perfil_url || "/images/logos/logofpazul.webp";
  const hasCompleteProfile = Boolean(profile.foto_perfil_url && profile.cv_url);
  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  const age = getAge(profile.fecha_de_nacimiento);

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        height: "100%",
        minHeight: { xs: 330, sm: 420 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: hasCompleteProfile ? "rgba(18, 98, 219, .34)" : "#dfe6ef",
        borderRadius: 2.5,
        boxShadow: "0 5px 18px rgba(8, 34, 70, .045)",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 16px 35px rgba(8, 34, 70, .11)",
          borderColor: "#8fb8f3",
        },
      }}
    >
      {hasCompleteProfile && (
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #1262db, #47a1ff)",
          }}
        />
      )}

      <Box
        component={Link}
        href={getProfilePath(profile)}
        sx={{
          position: "relative",
          display: "block",
          height: { xs: 135, sm: 210 },
          bgcolor: "#eaf0f7",
          overflow: "hidden",
          textDecoration: "none",
        }}
      >
        <Image
          src={profileImageUrl}
          alt={t("profile_image_alt", { name: fullName || t("player") })}
          width={360}
          height={250}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 300px"
          style={{
            width: "100%",
            height: "100%",
            objectFit: profile.foto_perfil_url ? "cover" : "contain",
            objectPosition: "center top",
            padding: profile.foto_perfil_url ? 0 : 54,
            opacity: profile.foto_perfil_url ? 1 : 0.28,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 55%, rgba(5, 20, 43, .62))",
          }}
        />
        {hasCompleteProfile && (
          <Chip
            icon={<VerifiedOutlinedIcon />}
            label={t("profile_complete_badge")}
            size="small"
            sx={{
              position: "absolute",
            top: { xs: 8, sm: 12 },
            left: { xs: 8, sm: 12 },
              color: "#fff",
              bgcolor: "rgba(7, 34, 72, .88)",
              fontWeight: 800,
              "& .MuiChip-icon": { color: "#56a4ff" },
            }}
          />
        )}
        {age !== null && (
          <Chip
            label={t("age_years", { age })}
            size="small"
            sx={{
              position: "absolute",
            right: { xs: 8, sm: 12 },
            bottom: { xs: 8, sm: 12 },
              color: "#fff",
              bgcolor: "rgba(7, 34, 72, .82)",
              fontWeight: 800,
            }}
          />
        )}
      </Box>

      <Stack sx={{ p: { xs: 1.25, sm: 2.25 }, flexGrow: 1 }}>
        <Typography
          component={Link}
          href={getProfilePath(profile)}
          sx={{
            color: "#09172d",
            fontSize: { xs: ".92rem", sm: "1.08rem" },
            lineHeight: 1.25,
            fontWeight: 900,
            textDecoration: "none",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {fullName || t("unnamed_profile")}
        </Typography>

        <Stack spacing={0.65} sx={{ mt: 1.25 }}>
          <Stack direction="row" spacing={0.55} alignItems="center">
            <SportsSoccerOutlinedIcon sx={{ fontSize: { xs: 15, sm: 17 }, color: "#3269b3" }} />
            <Typography variant="body2" sx={{ color: "#56657b", fontSize: { xs: ".78rem", sm: ".875rem" } }} noWrap>
              {profile.posicion_principal || t("position_not_specified")}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.55} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: { xs: 15, sm: 17 }, color: "#3269b3" }} />
            <Typography variant="body2" sx={{ color: "#56657b", fontSize: { xs: ".78rem", sm: ".875rem" } }} noWrap>
              {profile.nacionalidad || t("nationality_not_specified")}
            </Typography>
          </Stack>
        </Stack>

        {profile.resumen_profesional && (
          <Typography
            variant="body2"
            sx={{
              mt: 1.3,
              color: "#445269",
              lineHeight: 1.5,
              display: { xs: "none", sm: "-webkit-box" },
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {profile.resumen_profesional}
          </Typography>
        )}

        {Number(profile.average_rating) > 0 && (
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 1.3, display: { xs: "none", sm: "flex" } }}>
            <Rating
              size="small"
              value={Number(profile.average_rating)}
              readOnly
              precision={0.5}
            />
            <Typography variant="caption" sx={{ color: "#758196" }}>
              ({profile.total_ratings || 0})
            </Typography>
          </Stack>
        )}

        <Box sx={{ mt: "auto", pt: { xs: 1.25, sm: 2 } }}>
          <Button
            component={Link}
            href={getProfilePath(profile)}
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              borderColor: "#1262db",
              color: "#1262db",
              fontWeight: 900,
              minHeight: { xs: 40, sm: 32 },
              width: { xs: "100%", sm: "auto" },
              "&:hover": { bgcolor: "#edf5ff", borderColor: "#0d4faf" },
            }}
          >
            {t("view_profile")}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

export default memo(ProfileCard);
