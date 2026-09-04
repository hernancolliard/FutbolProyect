import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import ProfileCard from "@/components/profile/ProfileCard";
import { getApiBaseUrl } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { isProfileIndexable } from "@/lib/seoSlugs";
import {
  getCountrySlug,
  getPlayersCategoryPath,
  getSeoPosition,
} from "@/lib/profileSeoTaxonomy";

export const revalidate = 3600;

type PageProps = {
  params: { posicion: string; pais: string };
};

type CategoryData = {
  country: string;
  position: NonNullable<ReturnType<typeof getSeoPosition>>;
  profiles: Profile[];
} | null;

const getCategoryData = cache(
  async (positionSlug: string, countrySlug: string): Promise<CategoryData> => {
    const position = getSeoPosition(positionSlug);
    if (!position) return null;

    try {
      const nationalitiesResponse = await fetch(
        `${getApiBaseUrl()}/profiles/nacionalidades`,
        { next: { revalidate, tags: ["profile-nationalities"] } },
      );
      if (!nationalitiesResponse.ok) return null;

      const nationalities: string[] = await nationalitiesResponse.json();
      const country = nationalities.find(
        (item) => getCountrySlug(item) === getCountrySlug(countrySlug),
      );
      if (!country) return null;

      const query = new URLSearchParams({
        puesto: position.value,
        nacionalidad: country,
      });
      const profilesResponse = await fetch(
        `${getApiBaseUrl()}/profiles?${query.toString()}`,
        {
          next: {
            revalidate,
            tags: [`players:${position.slug}:${getCountrySlug(country)}`],
          },
        },
      );
      if (!profilesResponse.ok) return null;
      const payload = await profilesResponse.json();
      const profiles = Array.isArray(payload)
        ? payload.filter(isProfileIndexable)
        : [];

      return { country, position, profiles };
    } catch {
      return null;
    }
  },
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getCategoryData(params.posicion, params.pais);
  if (!data) {
    return {
      title: "Jugadores no encontrados",
      robots: { index: false, follow: false },
    };
  }

  const canonical = getPlayersCategoryPath(data.position.value, data.country);
  const title = `${data.position.label} de fútbol de ${data.country} | FutbolProyect`;
  const description = `Explorá perfiles de ${data.position.label.toLowerCase()} de fútbol de ${data.country}. Consultá trayectoria, videos, estadísticas y datos deportivos.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: data.profiles.length >= 3, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "FutbolProyect",
    },
  };
}

export default async function PlayersCategoryPage({ params }: PageProps) {
  const data = await getCategoryData(params.posicion, params.pais);
  if (!data) notFound();

  const canonical = getPlayersCategoryPath(data.position.value, data.country);
  if (`/jugadores/${params.posicion}/${params.pais}` !== canonical) {
    permanentRedirect(canonical);
  }
  if (data.profiles.length === 0) notFound();

  return (
    <main className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-5 text-sm text-slate-600">
          <Link href="/">Inicio</Link> / <Link href="/jugadores">Jugadores</Link> /{" "}
          <span>{data.position.label} en {data.country}</span>
        </nav>

        <header className="rounded-3xl bg-[#071c3c] px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Talento disponible
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {data.position.label} de fútbol de {data.country}
          </h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            Compará perfiles deportivos, trayectoria y material audiovisual de jugadores que actúan como {data.position.value.toLowerCase()} y tienen nacionalidad {data.country}.
          </p>
        </header>

        <section aria-labelledby="category-results" className="mt-8">
          <h2 id="category-results" className="mb-5 text-2xl font-bold text-[#071c3c]">
            Perfiles disponibles ({data.profiles.length})
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
