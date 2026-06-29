import { cache } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";
import {
  getProfileCompletion,
  getProfilePath,
} from "@/lib/seoSlugs";

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

const getDescription = (profile: Profile, fullName: string) => {
  const base = `Perfil deportivo de ${fullName}${profile.posicion_principal ? `, ${profile.posicion_principal}` : ""}.`;
  const details =
    " Consultá su trayectoria, datos deportivos, videos, estadísticas y contacto profesional en FutbolProyect.";
  return `${base}${details}`.slice(0, 160);
};

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

  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  const title = `${fullName}${profile.posicion_principal ? ` - ${profile.posicion_principal}` : ""} | FutbolProyect`;
  const description = getDescription(profile, fullName);
  const canonical = getProfilePath(profile);
  const shouldIndex = getProfileCompletion(profile) >= 50;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: true,
    },
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

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get("token")?.value;
  const profile = await fetchProfile(params.id, token);

  const schema = profile
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `https://www.futbolproyect.com${getProfilePath(profile)}`,
        name: `${profile.nombre || ""} ${profile.apellido || ""}`.trim(),
        jobTitle: profile.posicion_principal || undefined,
        nationality: profile.nacionalidad || undefined,
        birthDate: profile.fecha_de_nacimiento || undefined,
        image: profile.foto_perfil_url || undefined,
        description: profile.resumen_profesional || undefined,
        sameAs: [
          profile.linkedin_url,
          profile.instagram_url,
          profile.youtube_url,
          profile.transfermarkt_url,
        ].filter(Boolean),
      }
    : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ProfilePageClient profile={profile} requestedProfileId={params.id} />
    </>
  );
}
