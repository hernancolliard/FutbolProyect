import type { Metadata } from "next";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { isProfileIndexable } from "@/lib/seoSlugs";
import { getPlayersCategoryPath } from "@/lib/profileSeoTaxonomy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Jugadores de fútbol por posición y país | FutbolProyect" },
  description:
    "Encontrá jugadores de fútbol por posición y país. Explorá perfiles públicos con trayectoria, videos y datos deportivos.",
  alternates: { canonical: "/jugadores" },
};

async function getCategories() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/profiles`, {
      next: { revalidate, tags: ["players-categories"] },
    });
    if (!response.ok) return [];
    const profiles: Profile[] = await response.json();
    const categories = new Map<string, { path: string; label: string; count: number }>();

    profiles.filter(isProfileIndexable).forEach((profile) => {
      const path = getPlayersCategoryPath(
        profile.posicion_principal,
        profile.nacionalidad,
      );
      if (!path) return;
      const label = `${profile.posicion_principal} · ${profile.nacionalidad}`;
      const current = categories.get(path);
      categories.set(path, { path, label, count: (current?.count || 0) + 1 });
    });

    return [...categories.values()]
      .filter((category) => category.count >= 3)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

export default async function PlayersDirectoryPage() {
  const categories = await getCategories();

  return (
    <main className="bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-[#071c3c] sm:text-4xl">
          Jugadores de fútbol por posición y país
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Accedé a categorías con perfiles suficientes para comparar talento de forma útil y directa.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.path}
              href={category.path}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-[#071c3c] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-semibold">{category.label}</span>
              <span className="mt-1 block text-sm text-slate-500">
                {category.count} perfiles
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
