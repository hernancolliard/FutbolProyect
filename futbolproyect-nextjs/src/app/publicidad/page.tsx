import type { Metadata } from "next";
import AdvertisingPageClient from "@/components/ads/AdvertisingPageClient";

export const metadata: Metadata = {
  title: "Publicidad y Sponsors en FutbolProyect | Anuncia con nosotros",
  description:
    "Conoce los planes para publicitar en FutbolProyect y promociona tu club, academia, marca deportiva, evento o servicio ante jugadores, agentes, scouts y clubes.",
  alternates: {
    canonical: "/publicidad",
  },
};

export default function AdvertisingPage() {
  return <AdvertisingPageClient />;
}
