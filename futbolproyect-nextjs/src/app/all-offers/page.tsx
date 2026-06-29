import type { Metadata } from "next";
import AllOffersClient from "@/components/client-components/AllOffersClient";
import { getApiBaseUrl } from "@/lib/api";
import { Offer } from "@/lib/types";

export const dynamic = "force-dynamic";

const title = "Ofertas de fútbol para jugadores y profesionales | FutbolProyect";
const description =
  "Encontrá ofertas de fútbol para jugadores, entrenadores, analistas, scouts y profesionales. Conectá con clubes, agencias y proyectos deportivos.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/all-offers" },
  openGraph: {
    type: "website",
    url: "/all-offers",
    title,
    description,
    siteName: "FutbolProyect",
  },
};

type OffersResponse = {
  offers: Offer[];
  totalPages: number;
  currentPage: number;
  totalOffers: number;
};

type FilterOptions = {
  puestos: string[];
  ubicaciones: string[];
  niveles: string[];
  horarios: string[];
};

async function getInitialOffers() {
  const apiUrl = getApiBaseUrl();

  try {
    const [offersResponse, filtersResponse] = await Promise.all([
      fetch(`${apiUrl}/offers?page=1&limit=10&show=all`, {
        cache: "no-store",
      }),
      fetch(`${apiUrl}/offers/filter-options`, { cache: "no-store" }),
    ]);

    const offers: OffersResponse | undefined = offersResponse.ok
      ? await offersResponse.json()
      : undefined;
    const filters: FilterOptions | undefined = filtersResponse.ok
      ? await filtersResponse.json()
      : undefined;

    return { offers, filters };
  } catch (error) {
    console.error("Error fetching initial offers:", error);
    return {};
  }
}

export default async function AllOffersPage() {
  const { offers, filters } = await getInitialOffers();

  return (
    <AllOffersClient
      initialData={offers}
      initialFilterOptions={filters}
    />
  );
}
