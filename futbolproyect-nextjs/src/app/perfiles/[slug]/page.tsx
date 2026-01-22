import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileById } from "@/lib/profiles";
import { Profile } from "@/lib/types";

/* =========================
   SEO DINÁMICO
========================= */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await getProfileById(params.slug);

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
  const profile: Profile | null = await getProfileById(params.slug);

  if (!profile) notFound();

  const nombreCompleto = `${profile.nombre} ${profile.apellido}`;

  /* =========================
     SCHEMA.ORG AVANZADO
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
    ].filter(Boolean),

    // HEIGHT / WEIGHT
    height: profile.altura_cm
      ? {
          "@type": "QuantitativeValue",
          value: profile.altura_cm,
          unitText: "cm",
        }
      : undefined,

    weight: profile.peso_kg
      ? {
          "@type": "QuantitativeValue",
          value: profile.peso_kg,
          unitText: "kg",
        }
      : undefined,

    // RATINGS (rich snippet)
    aggregateRating:
      profile.average_rating && profile.total_ratings
        ? {
            "@type": "AggregateRating",
            ratingValue: profile.average_rating,
            ratingCount: profile.total_ratings,
          }
        : undefined,
  };

  /* =========================
     BREADCRUMB (opcional pero recomendado)
  ========================= */
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Perfiles",
        item: "https://futbolproyect.com/perfiles",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: nombreCompleto,
        item: `https://futbolproyect.com/perfiles/${profile.id}`,
      },
    ],
  };

  return (
    <>
      {/* ========= SCHEMA ========= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ========= CONTENIDO ========= */}
      <main>
        <h1>{nombreCompleto}</h1>

        <p>
          <strong>Posición:</strong> {profile.posicion_principal}
        </p>

        <p>
          <strong>Nacionalidad:</strong> {profile.nacionalidad}
        </p>

        {profile.altura_cm && (
          <p>
            <strong>Altura:</strong> {profile.altura_cm} cm
          </p>
        )}

        {profile.peso_kg && (
          <p>
            <strong>Peso:</strong> {profile.peso_kg} kg
          </p>
        )}

        <p>
          <strong>Pie dominante:</strong> {profile.pie_dominante}
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
