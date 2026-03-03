import { type Metadata } from "next";
import { getTranslation } from "@/lib/i18n-server";
import { Profile } from "@/lib/types";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { getApiBaseUrl } from "@/lib/api";

// IMPORTANTE: Forzamos renderizado dinámico para evitar errores de fetch en el build
export const dynamic = "force-dynamic";

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const apiUrl = getApiBaseUrl();
  
  console.log(`[fetchProfile] Fetching profile for userId: ${userId}`);
  console.log(`[fetchProfile] API URL: ${apiUrl}/profiles/${userId}`);

  try {
    const res = await fetch(`${apiUrl}/profiles/${userId}`, {
      cache: "no-store",
    });

    console.log(`[fetchProfile] Response status for ${userId}: ${res.status}`);

    if (!res.ok) {
      console.error(
        `[fetchProfile] Failed to fetch profile for user ${userId}: ${res.statusText}`,
      );
      return null;
    }
    const data = await res.json();
    console.log(`[fetchProfile] Data for user ${userId}:`, data);
    return data;
  } catch (error) {
    console.error(`[fetchProfile] Network error fetching profile for user ${userId}:`, error);
    return null;
  }
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { lang?: string };
}): Promise<Metadata> {
  const { t } = await getTranslation(searchParams?.lang);
  const profile = await fetchProfile(params.id);

  if (!profile) {
    return {
      title: t("profile_not_found"),
    };
  }

  const lang = searchParams?.lang === "en" ? "en" : "es";
  const resumen_profesional =
    (profile as any)[`resumen_profesional_${lang}`] ||
    profile.resumen_profesional;
  const posicion_principal =
    (profile as any)[`posicion_principal_${lang}`] ||
    profile.posicion_principal;

  const seoTitle = `${profile.nombre || ""} ${profile.apellido || ""}${posicion_principal ? ` - ${posicion_principal}` : ""} | FutbolProyect`;
  const seoDescription = resumen_profesional
    ? resumen_profesional.substring(0, 160)
    : `Perfil de ${profile.nombre || ""} ${profile.apellido || ""} en FutbolProyect.`;

  const url = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${profile.id}`
    : "";

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "profile",
      url: url,
      images: [
        {
          url: profile.foto_perfil_url || "/images/logos/logofp.png",
          alt: `Perfil de ${profile.nombre} ${profile.apellido || ""}`,
        },
      ],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await fetchProfile(params.id);
  return <ProfilePageClient profile={profile} />;
}
