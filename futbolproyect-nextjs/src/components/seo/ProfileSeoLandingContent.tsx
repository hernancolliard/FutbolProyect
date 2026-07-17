"use client";

import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SeoPage from "@/components/shared/SeoPage";
import ProfileCard from "@/components/profile/ProfileCard";
import { Profile } from "@/lib/types";

type Props = {
  profiles: Profile[];
  translationPrefix: string;
  ctaLink: string;
};

export default function ProfileSeoLandingContent({
  profiles,
  translationPrefix,
  ctaLink,
}: Props) {
  const { t } = useTranslation("common");

  return (
    <SeoPage
      h1={t(`${translationPrefix}_h1`)}
      mainText={t(`${translationPrefix}_main_text`)}
      h2={t(`${translationPrefix}_h2`)}
      ctaText={t(`${translationPrefix}_cta`)}
      ctaLink={ctaLink}
      internalLinks={[
        { href: "/perfiles", label: t("explore_all_profiles") },
        { href: "/all-offers", label: t("seo_link_football_opportunities") },
        { href: "/create-offer", label: t("publish_offer") },
      ]}
    >
      {profiles.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {profiles.slice(0, 12).map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: "#5e6c81" }}>
          {t(
            "public_profiles_coming_soon",
            "Los perfiles públicos estarán disponibles próximamente.",
          )}
        </Typography>
      )}
    </SeoPage>
  );
}
