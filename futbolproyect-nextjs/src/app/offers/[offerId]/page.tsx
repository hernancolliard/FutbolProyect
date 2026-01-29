import type { Metadata } from "next";
import OfferDetailClient from "./OfferDetailClient";

type Props = {
  params: { offerId: string };
};

/* =========================
   SEO SEGURO PARA STATIC
========================= */
export const metadata: Metadata = {
  title: "Oferta de trabajo en fútbol | FutbolProyect",
  description:
    "Detalle de oferta laboral en el sector fútbol. Postulate y conocé más en FutbolProyect.",
};

/* =========================
   PAGE
========================= */
export default function Page({ params }: Props) {
  return <OfferDetailClient offerId={params.offerId} />;
}
