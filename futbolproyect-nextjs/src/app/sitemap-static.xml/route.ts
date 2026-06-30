import { blogPosts } from "@/data/blogPosts";

const BASE_URL = "https://www.futbolproyect.com";

const routes = [
  { path: "/", priority: "1.0", changeFrequency: "daily" },
  { path: "/blog", priority: "0.8", changeFrequency: "weekly" },
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "0.7",
    changeFrequency: "monthly",
  })),
  { path: "/all-offers", priority: "0.9", changeFrequency: "daily" },
  { path: "/perfiles", priority: "0.9", changeFrequency: "daily" },
  {
    path: "/ofertas-trabajo-futbol",
    priority: "0.8",
    changeFrequency: "weekly",
  },
  { path: "/ofertas/futbolistas", priority: "0.8", changeFrequency: "daily" },
  { path: "/ofertas/entrenadores", priority: "0.8", changeFrequency: "daily" },
  {
    path: "/ofertas/analistas-de-futbol",
    priority: "0.8",
    changeFrequency: "daily",
  },
  { path: "/ofertas/scouts", priority: "0.8", changeFrequency: "daily" },
  { path: "/perfiles/jugadores", priority: "0.8", changeFrequency: "daily" },
  {
    path: "/clubes/buscar-jugadores",
    priority: "0.8",
    changeFrequency: "weekly",
  },
  {
    path: "/agencias/representantes",
    priority: "0.7",
    changeFrequency: "weekly",
  },
  { path: "/scouting/informes", priority: "0.7", changeFrequency: "weekly" },
  { path: "/register", priority: "0.7", changeFrequency: "monthly" },
  { path: "/create-offer", priority: "0.7", changeFrequency: "monthly" },
  { path: "/contact", priority: "0.5", changeFrequency: "monthly" },
  { path: "/suscripcion", priority: "0.5", changeFrequency: "monthly" },
  { path: "/terms", priority: "0.2", changeFrequency: "yearly" },
  { path: "/privacy", priority: "0.2", changeFrequency: "yearly" },
];

export async function GET() {
  const urls = routes
    .map(
      ({ path, priority, changeFrequency }) => `<url>
  <loc>${BASE_URL}${path}</loc>
  <changefreq>${changeFrequency}</changefreq>
  <priority>${priority}</priority>
</url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
