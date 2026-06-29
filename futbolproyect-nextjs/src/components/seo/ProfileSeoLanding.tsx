import { Box, Typography } from "@mui/material";
import SeoPage from "@/components/shared/SeoPage";
import ProfileCard from "@/components/profile/ProfileCard";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";

type ProfileSeoLandingProps = {
  h1: string;
  mainText: string;
  h2: string;
  ctaText: string;
  ctaLink: string;
};

async function getProfiles(): Promise<Profile[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/profiles`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ProfileSeoLanding({
  h1,
  mainText,
  h2,
  ctaText,
  ctaLink,
}: ProfileSeoLandingProps) {
  const profiles = await getProfiles();

  return (
    <SeoPage
      h1={h1}
      mainText={mainText}
      h2={h2}
      ctaText={ctaText}
      ctaLink={ctaLink}
      internalLinks={[
        { href: "/perfiles", label: "Explorar todos los perfiles" },
        { href: "/all-offers", label: "Oportunidades de fútbol" },
        { href: "/create-offer", label: "Publicar una oferta" },
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
          Los perfiles públicos estarán disponibles próximamente.
        </Typography>
      )}
    </SeoPage>
  );
}
