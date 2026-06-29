export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.futbolproyect.com/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://www.futbolproyect.com/sitemap-perfiles.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://www.futbolproyect.com/sitemap-ofertas.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
