import { getAllProfiles } from "@/lib/profiles";
import { getProfilePath } from "@/lib/seoSlugs";

export const dynamic = "force-dynamic";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getLastModified = (profile: any) => {
  const value = profile.updated_at || profile.created_at;
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

export async function GET() {
  try {
    const profiles = await getAllProfiles();

    const urls = profiles
      .filter(
        (profile: any) =>
          profile.is_indexable === true ||
          Number(profile.completion_score || 0) >= 5,
      )
      .map((profile: any) => {
        const location = escapeXml(
          `https://www.futbolproyect.com${getProfilePath(profile)}`,
        );
        const lastModified = getLastModified(profile);
        return `<url>
  <loc>${location}</loc>${lastModified ? `\n  <lastmod>${lastModified}</lastmod>` : ""}
</url>`;
      });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating perfiles sitemap:", error);
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new Response(empty, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
