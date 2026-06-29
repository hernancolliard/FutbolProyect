import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getApiBaseUrl } from "@/lib/api";
import { Profile } from "@/lib/types";
import {
  getProfileCompletion,
  getProfilePath,
  parseSeoId,
} from "@/lib/seoSlugs";

export const dynamic = "force-dynamic";

const getProfile = cache(async (slug: string): Promise<Profile | null> => {
  const profileId = parseSeoId(slug);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/profiles/${encodeURIComponent(profileId)}`,
      { cache: "no-store" },
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
  const shouldIndex = getProfileCompletion(profile) >= 50;

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

  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://www.futbolproyect.com${getProfilePath(profile)}`,
    name: fullName,
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <ProfilePageClient
        profile={profile}
        requestedProfileId={String(profile.id)}
      />
    </>
  );
}
