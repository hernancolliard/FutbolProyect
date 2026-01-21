import apiClient from "@/lib/apiClient";

export async function getOfferById(offerId: string) {
  const res = await apiClient.get(`/offers/${offerId}`);
  return res.data;
}
