import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import HomeSeoOverview from "@/components/home/HomeSeoOverview";
import type { FeaturedVideo, Offer, Profile } from "@/lib/types";

const title =
  "FutbolProyect | Mostrá tu fútbol y conectá con oportunidades";
const description =
  "Creá tu perfil deportivo en FutbolProyect, cargá videos, fotos, trayectoria y datos profesionales. Conectá con clubes, agencias, scouts y nuevas oportunidades en el fútbol.";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "FutbolProyect",
    title,
    description,
    images: [
      {
        url: "/images/jugador-estadio-futbol.webp",
        width: 1672,
        height: 941,
        alt: "Futbolista en un estadio con el logo de FutbolProyect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/jugador-estadio-futbol.webp"],
  },
};

type HomeOffersData = {
  offers: Offer[];
  totalOffers: number;
};

const getApiBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) {
    return `http://localhost:${process.env.PORT || 5000}/api`;
  }

  return `${raw.replace(/\/+$/, "").replace(/\/api$/, "")}/api`;
};

async function getHomeData(): Promise<{
  offersData: HomeOffersData;
  featuredProfiles: Profile[];
  featuredVideos: FeaturedVideo[];
}> {
  const apiBaseUrl = getApiBaseUrl();

  try {
    const [offersResponse, profilesResponse, videosResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/offers?limit=6&show=all`, {
        next: { revalidate: 300 },
      }),
      fetch(`${apiBaseUrl}/profiles/featured`, {
        next: { revalidate: 300 },
      }),
      fetch(`${apiBaseUrl}/profiles/featured-videos?limit=30`, {
        next: { revalidate: 300 },
      }),
    ]);

    const offersPayload = offersResponse.ok ? await offersResponse.json() : {};
    const profilesPayload = profilesResponse.ok
      ? await profilesResponse.json()
      : [];
    const videosPayload = videosResponse.ok ? await videosResponse.json() : [];

    return {
      offersData: {
        offers: Array.isArray(offersPayload?.offers)
          ? offersPayload.offers
          : [],
        totalOffers: Number(offersPayload?.totalOffers || 0),
      },
      featuredProfiles: Array.isArray(profilesPayload) ? profilesPayload : [],
      featuredVideos: Array.isArray(videosPayload) ? videosPayload : [],
    };
  } catch (error) {
    console.error("Unable to load home data during server rendering:", error);
    return {
      offersData: { offers: [], totalOffers: 0 },
      featuredProfiles: [],
      featuredVideos: [],
    };
  }
}

export default async function HomePage() {
  const { offersData, featuredProfiles, featuredVideos } = await getHomeData();

  return (
    <HomePageClient
      offersData={offersData}
      featuredProfiles={featuredProfiles}
      featuredVideos={featuredVideos}
      seoOverview={<HomeSeoOverview />}
    />
  );
}
