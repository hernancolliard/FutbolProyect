import ProfileSeoLandingContent from "./ProfileSeoLandingContent";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";

type ProfileSeoLandingProps = {
  translationPrefix: string;
  ctaLink: string;
};

async function getProfiles(): Promise<Profile[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/profiles`, {
      next: { revalidate: 600, tags: ["profiles-seo-landings"] },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ProfileSeoLanding({
  translationPrefix,
  ctaLink,
}: ProfileSeoLandingProps) {
  const profiles = await getProfiles();

  return (
    <ProfileSeoLandingContent
      profiles={profiles}
      translationPrefix={translationPrefix}
      ctaLink={ctaLink}
    />
  );
}
