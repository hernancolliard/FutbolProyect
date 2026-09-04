import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";
import { getProfilePath } from "@/lib/seoSlugs";

export const dynamic = "force-dynamic";

const fetchProfile = cache(
  async (userId: string, token?: string): Promise<Profile | null> => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/profiles/${encodeURIComponent(userId)}`,
        {
          cache: "no-store",
          headers: token ? { Cookie: `token=${token}` } : undefined,
        },
      );
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error(`Error fetching profile ${userId}:`, error);
      return null;
    }
  },
);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const token = cookies().get("token")?.value;
  const profile = await fetchProfile(params.id, token);

  if (!profile) {
    return {
      title: "Perfil no encontrado",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Perfil privado | FutbolProyect",
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get("token")?.value;
  const profile = await fetchProfile(params.id, token);

  if (profile?.tipo_usuario === "postulante") {
    permanentRedirect(getProfilePath(profile));
  }

  return <ProfilePageClient profile={profile} requestedProfileId={params.id} />;
}
