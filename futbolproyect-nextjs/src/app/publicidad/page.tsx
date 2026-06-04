import type { Metadata } from "next";
import AdvertisingPageClient from "@/components/ads/AdvertisingPageClient";

export const metadata: Metadata = {
  title: "Publicidad y Sponsors en FutbolProyect | Anuncia con nosotros",
  description:
    "Promociona tu club, academia, marca deportiva, evento o servicio ante jugadores, agentes, scouts y clubes dentro de FutbolProyect.",
  alternates: {
    canonical: "/publicidad",
  },
};

export default function AdvertisingPage() {
  return <AdvertisingPageClient />;
}
