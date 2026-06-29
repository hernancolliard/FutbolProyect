import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { getApiBaseUrl } from "@/lib/api";
import { Offer } from "@/lib/types";

type OfferSeoLandingProps = {
  role: string;
  h1: string;
  mainText: string;
  h2: string;
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
  h1,
  mainText,
  h2,
}: OfferSeoLandingProps) {
  const offers = await getOffers(role);

  return (
    <SeoPage
      h1={h1}
      mainText={mainText}
      h2={h2}
      ctaText="Creá tu perfil gratis en FutbolProyect"
      ctaLink="/register"
      internalLinks={[
        { href: "/all-offers", label: "Ver todas las ofertas" },
        { href: "/perfiles/jugadores", label: "Perfiles de jugadores" },
        { href: "/create-offer", label: "Publicar una oferta" },
      ]}
    >
      {offers.length > 0 ? (
        <OfferList offers={offers} isHomePage={false} showApplyButton={false} />
      ) : null}
    </SeoPage>
  );
}
