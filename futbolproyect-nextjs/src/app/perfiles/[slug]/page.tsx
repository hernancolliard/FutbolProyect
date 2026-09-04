import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import ProfileStructuredData from "@/components/seo/ProfileStructuredData";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";
import {
  getProfilePath,
  isProfileIndexable,
  parseSeoId,
} from "@/lib/seoSlugs";

export const revalidate = 3600;

const getProfile = cache(async (slug: string): Promise<Profile | null> => {
  const profileId = parseSeoId(slug);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/profiles/${encodeURIComponent(profileId)}`,
      {
        next: {
          revalidate,
          tags: [`profile:${profileId}`],
        },
      },
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getProfile(params.slug);

  if (!profile) {
    return {
      title: "Perfil no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  const title = `${fullName}${profile.posicion_principal ? ` - ${profile.posicion_principal}` : ""} | FutbolProyect`;
  const description =
    `Perfil deportivo de ${fullName}${profile.posicion_principal ? `, ${profile.posicion_principal}` : ""}. ` +
    "Consultá su trayectoria, datos deportivos, videos, estadísticas y contacto profesional.";
  const canonical = getProfilePath(profile);
  const shouldIndex = isProfileIndexable(profile);

  return {
    title: { absolute: title },
    description: description.slice(0, 160),
    alternates: { canonical },
    robots: { index: shouldIndex, follow: true },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      siteName: "FutbolProyect",
      images: profile.foto_perfil_url
        ? [
            {
              url: profile.foto_perfil_url,
              alt: `Perfil deportivo de ${fullName}`,
            },
          ]
        : [{ url: "/images/logos/logofpazul.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        profile.foto_perfil_url || "/images/logos/logofpazul.webp",
      ],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getProfile(params.slug);
  if (!profile) notFound();

  const canonical = getProfilePath(profile);
  if (`/perfiles/${params.slug}` !== canonical) permanentRedirect(canonical);

  return (
    <>
      <ProfileStructuredData profile={profile} />
      <ProfilePageClient
        profile={profile}
        requestedProfileId={String(profile.id)}
      />
    </>
  );
}
