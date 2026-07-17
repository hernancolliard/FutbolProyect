import OfferSeoLandingContent from "./OfferSeoLandingContent";
import { getApiBaseUrl } from "@/lib/api";
import { Offer } from "@/lib/types";

type OfferSeoLandingProps = {
  role: string;
  translationPrefix: string;
};

async function getOffers(role: string): Promise<Offer[]> {
  try {
    const params = new URLSearchParams({
      puesto: role,
      show: "all",
      limit: "50",
    });
    const response = await fetch(
      `${getApiBaseUrl()}/offers?${params.toString()}`,
      { cache: "no-store" },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.offers || [];
  } catch {
    return [];
  }
}

export default async function OfferSeoLanding({
  role,
  translationPrefix,
}: OfferSeoLandingProps) {
  const offers = await getOffers(role);

  return (
    <OfferSeoLandingContent
      offers={offers}
      translationPrefix={translationPrefix}
    />
  );
}
