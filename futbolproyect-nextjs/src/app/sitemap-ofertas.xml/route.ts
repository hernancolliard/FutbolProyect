import { getAllOffers } from "@/lib/offers";
import { getOfferPath } from "@/lib/seoSlugs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const offers = await getAllOffers();

    const urls = offers.map(
      (offer: any) => `<url>
  <loc>https://www.futbolproyect.com${getOfferPath(offer)}</loc>
</url>`,
    );

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
    console.error("Error generating ofertas sitemap:", error);
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new Response(empty, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
