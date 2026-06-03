import type { Metadata } from "next";
import OfferDetailClient from "./OfferDetailClient";

type Props = {
  params: { offerId: string };
};

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: "Detalle de oferta | FutbolProyect",
    description:
      "Accede al detalle completo de esta oferta con una suscripcion activa en FutbolProyect.",
    alternates: {
      canonical: `/offers/${params.offerId}`,
    },
  };
}

export default function Page({ params }: Props) {
  return <OfferDetailClient offerId={params.offerId} />;
}
