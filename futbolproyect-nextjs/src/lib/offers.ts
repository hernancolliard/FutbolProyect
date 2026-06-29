import apiClient from "@/lib/apiClient";
import { Offer } from "@/lib/types";

export async function getOfferById(offerId: string) {
  const res = await apiClient.get(`/offers/${offerId}`);
  return res.data;
}
const getBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw) {
    // quitar barra final
    let url = raw.replace(/\/+$/, '');
    // si alguien puso /api al final, quitarlo para evitar duplicados
    url = url.replace(/\/api$/, '');
    return url;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};
export async function getAllOffers(): Promise<Offer[]> {
  const apiUrl = getBaseUrl();
  const res = await fetch(`${apiUrl}/api/offers`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.offers) ? data.offers : [];
}
