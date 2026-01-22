import { getAllOffers } from "@/lib/offers";

export default async function sitemap() {
  const offers = await getAllOffers();

  return offers.map((o) => ({
    url: `https://futbolproyect.com/ofertas/${o.id}`,
    lastModified: new Date().toISOString(),
  }));
}
