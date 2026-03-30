import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Profile } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api";

/* =========================
   CONFIG
========================= */

// Forzamos render dinámico (Vercel friendly)
export const dynamic = "force-dynamic";

// API base (normalizado con /api)
const API_URL = getApiBaseUrl();

/* =========================
   API HELPERS (RUNTIME)
========================= */

async function getProfileBySlug(slug: string): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_URL}/profiles/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

/* =========================
   SEO DINÁMICO
========================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    return {
      title: "Perfil no encontrado | FutbolProyect",
      description: "El perfil solicitado no existe o fue eliminado.",
    };
  }

  const nombreCompleto = `${profile.nombre} ${profile.apellido}`;

  return {
    title: `${nombreCompleto} | ${profile.posicion_principal}`,
    description:
      profile.resumen_profesional?.slice(0, 160) ||
      `Perfil profesional de ${nombreCompleto}`,
    openGraph: {
      title: `${nombreCompleto} | FutbolProyect`,
      description: profile.resumen_profesional?.slice(0, 160),
      images: profile.foto_perfil_url ? [{ url: profile.foto_perfil_url }] : [],
    },
  };
}

/* =========================
   PAGE
========================= */

export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) notFound();

  const nombreCompleto = `${profile.nombre} ${profile.apellido}`;

  /* =========================
     SCHEMA.ORG
  ========================= */
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsPerson",
    "@id": `https://futbolproyect.com/perfiles/${profile.id}`,
    name: nombreCompleto,
    jobTitle: profile.posicion_principal,
    nationality: profile.nacionalidad,
    birthDate: profile.fecha_de_nacimiento,
    image: profile.foto_perfil_url,
    description: profile.resumen_profesional,
    sport: "Soccer",
    sameAs: [
      profile.linkedin_url,
      profile.instagram_url,
      profile.youtube_url,
      profile.transfermarkt_url,
      profile.whatsapp_url,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main>
        <h1>{nombreCompleto}</h1>

        <p>
          <strong>Posición:</strong> {profile.posicion_principal}
        </p>

        <p>
          <strong>Nacionalidad:</strong> {profile.nacionalidad}
        </p>

        {profile.resumen_profesional && (
          <section>
            <h2>Perfil profesional</h2>
            <p>{profile.resumen_profesional}</p>
          </section>
        )}
      </main>
    </>
  );
}
