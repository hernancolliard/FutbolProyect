import { getAllProfiles } from "@/lib/profiles";
import { getPlayersCategoryPath } from "@/lib/profileSeoTaxonomy";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.futbolproyect.com";

export async function GET() {
  try {
    const profiles = await getAllProfiles();
    const categories = new Map<string, { count: number; lastModified: string }>();

    profiles
      .filter(
        (profile: any) =>
          profile.is_indexable === true ||
          Number(profile.completion_score || 0) >= 5,
      )
      .forEach((profile: any) => {
        const path = getPlayersCategoryPath(
          profile.posicion_principal,
          profile.nacionalidad,
        );
        if (!path) return;
        const current = categories.get(path);
        const modified = profile.updated_at || profile.created_at || "";
        categories.set(path, {
          count: (current?.count || 0) + 1,
          lastModified:
            !current?.lastModified || modified > current.lastModified
              ? modified
              : current.lastModified,
        });
      });

    const urls = [...categories.entries()]
      .filter(([, category]) => category.count >= 3)
      .map(([path, category]) => {
        const parsedDate = category.lastModified
          ? new Date(category.lastModified)
          : null;
        const lastModified =
          parsedDate && !Number.isNaN(parsedDate.getTime())
            ? `\n  <lastmod>${parsedDate.toISOString()}</lastmod>`
            : "";
        return `<url>\n  <loc>${BASE_URL}${path}</loc>${lastModified}\n</url>`;
      });

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error generating players sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { "Content-Type": "application/xml; charset=utf-8" } },
    );
  }
}
