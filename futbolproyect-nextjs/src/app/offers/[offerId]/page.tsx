import type { Metadata } from "next";
import OfferDetailClient from "./OfferDetailClient";
import { getApiBaseUrl } from "@/lib/api";

type Props = {
  params: { offerId: string };
};

async function getOffer(offerId: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/offers/${offerId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = await getOffer(params.offerId);

  if (!offer) {
    return {
      title: "Oferta no encontrada | FutbolProyect",
      description: "La oferta solicitada no existe o ya no esta disponible.",
    };
  }

  const titleParts = [offer.titulo, offer.puesto, offer.ubicacion].filter(Boolean);
  const title = `${titleParts.join(" - ")} | FutbolProyect`;
  const description =
    offer.descripcion?.slice(0, 155) ||
    `Oferta laboral en futbol publicada por ${offer.nombre_ofertante || "FutbolProyect"}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/offers/${params.offerId}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: offer.imagen_url ? [{ url: offer.imagen_url }] : [],
    },
  };
}

export default function Page({ params }: Props) {
  return <OfferDetailClient offerId={params.offerId} />;
}
