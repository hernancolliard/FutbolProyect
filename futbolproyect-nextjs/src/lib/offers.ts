import apiClient from "@/lib/apiClient";

export async function getOfferById(offerId: string) {
  const res = await apiClient.get(`/offers/${offerId}`);
  return res.data;
}
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};
export async function getAllOffers() {
  const apiUrl = getBaseUrl();
  const res = await fetch(`${apiUrl}/offers`, { cache: "no-store" });
  return res.json();
}
