import { getAllOffers } from "@/lib/offers";

export async function GET() {
  try {
    const offers = await getAllOffers();

    const urls = offers.map((o: any) => {
      return `
      <url>
        <loc>https://futbolproyect.com/offers/${o.id}</loc>
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
  } catch (error) {
    console.error("Error generating ofertas sitemap:", error);
    const empty = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new Response(empty, { headers: { "Content-Type": "application/xml" } });
  }
}
