import type { Profile } from "@/lib/types";
import { getProfilePath } from "@/lib/seoSlugs";

const BASE_URL = "https://www.futbolproyect.com";

export default function ProfileStructuredData({ profile }: { profile: Profile }) {
  const canonicalUrl = `${BASE_URL}${getProfilePath(profile)}`;
  const fullName = `${profile.nombre || ""} ${profile.apellido || ""}`.trim();
  const hasRealImage =
    Boolean(profile.foto_perfil_url) &&
    !String(profile.foto_perfil_url).includes("/images/logos/");

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonicalUrl}#profile-page`,
    url: canonicalUrl,
    name: `Perfil deportivo de ${fullName}`,
    dateCreated: profile.created_at || undefined,
    dateModified: profile.updated_at || undefined,
    mainEntity: {
      "@type": "Person",
      "@id": `${canonicalUrl}#person`,
      identifier: String(profile.id),
      name: fullName,
      description: profile.resumen_profesional || undefined,
      image: hasRealImage ? profile.foto_perfil_url : undefined,
      jobTitle: profile.posicion_principal || undefined,
      nationality: profile.nacionalidad || undefined,
      birthDate: profile.fecha_de_nacimiento || undefined,
      sameAs: [
        profile.linkedin_url,
        profile.instagram_url,
        profile.youtube_url,
        profile.transfermarkt_url,
      ].filter(Boolean),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
