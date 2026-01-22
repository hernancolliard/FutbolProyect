import { getAllProfiles } from "@/lib/profiles";

export async function GET() {
  const profiles = await getAllProfiles();

  const urls = profiles.map((p: any) => {
    return `
      <url>
        <loc>https://futbolproyect.com/perfiles/${p.id}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join("")}
    </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
