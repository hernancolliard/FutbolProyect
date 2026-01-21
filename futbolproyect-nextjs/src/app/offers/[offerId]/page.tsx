import { Metadata } from "next";
import { getOfferById } from "@/lib/offers";
import OfferDetailClient from "./OfferDetailClient";

type Props = {
  params: { offerId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = await getOfferById(params.offerId);

  return {
    title: `${offer.titulo} | FutbolProyect`,
    description: offer.descripcion?.slice(0, 160),
    openGraph: {
      title: offer.titulo,
      description: offer.descripcion,
    },
  };
}

export default function Page({ params }: Props) {
  return <OfferDetailClient offerId={params.offerId} />;
}
