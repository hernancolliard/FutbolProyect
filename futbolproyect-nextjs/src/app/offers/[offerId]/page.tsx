import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferDetailClient from "./OfferDetailClient";
import { getApiBaseUrl } from "@/lib/api";
import { Offer } from "@/lib/types";
import { getOfferPath, parseSeoId } from "@/lib/seoSlugs";

type Props = {
  params: { offerId: string };
};

const fetchPublicOffer = cache(async (param: string): Promise<Offer | null> => {
  const offerId = parseSeoId(param);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/offers/public/${encodeURIComponent(offerId)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching public offer:", error);
    return null;
  }
});

const plainText = (value?: string) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getEmploymentType = (schedule?: string) => {
  const normalized = String(schedule || "").toLowerCase();
  if (normalized.includes("tiempo completo") || normalized.includes("full")) {
    return "FULL_TIME";
  }
  if (normalized.includes("medio tiempo") || normalized.includes("part")) {
    return "PART_TIME";
  }
  if (normalized.includes("temporal")) return "TEMPORARY";
  if (normalized.includes("práctica") || normalized.includes("pasant")) {
    return "INTERN";
  }
  return undefined;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = await fetchPublicOffer(params.offerId);

  if (!offer) {
    return {
      title: "Oferta no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const title = `${offer.titulo} | Oferta de fútbol en FutbolProyect`;
  const description =
    plainText(offer.descripcion).slice(0, 155) ||
    `Oferta de fútbol para ${offer.puesto || "profesionales"} en ${offer.ubicacion || "FutbolProyect"}.`;
  const canonical = getOfferPath(offer);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "FutbolProyect",
      images: offer.imagen_url
        ? [{ url: offer.imagen_url, alt: `Oferta: ${offer.titulo}` }]
        : [{ url: "/images/jugador-estadio-futbol.webp" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        offer.imagen_url || "/images/jugador-estadio-futbol.webp",
      ],
    },
  };
}

export default async function OfferPage({ params }: Props) {
  const offer = await fetchPublicOffer(params.offerId);
  if (!offer) notFound();

  const canonical = getOfferPath(offer);
  const isRemote = /remot|distancia|teletrabajo/i.test(
    `${offer.ubicacion || ""} ${offer.horarios || ""}`,
  );
  const jobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: offer.titulo,
    description: plainText(offer.descripcion),
    datePosted: offer.fecha_publicacion || undefined,
    employmentType: getEmploymentType(offer.horarios),
    directApply: false,
    url: `https://www.futbolproyect.com${canonical}`,
    hiringOrganization: {
      "@type": "Organization",
      name: offer.nombre_ofertante || "FutbolProyect",
      sameAs: "https://www.futbolproyect.com",
      logo: offer.imagen_url || undefined,
    },
    ...(isRemote
      ? { jobLocationType: "TELECOMMUTE" }
      : offer.ubicacion
        ? {
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: offer.ubicacion,
              },
            },
          }
        : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobPosting).replace(/</g, "\\u003c"),
        }}
      />
      <OfferDetailClient offerId={String(offer.id)} initialOffer={offer} />
    </>
  );
}
