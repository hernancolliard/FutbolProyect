import type { Metadata } from "next";
import AdvertisingPageClient from "@/components/ads/AdvertisingPageClient";

export const metadata: Metadata = {
  title: "Advertising and Sponsors | FutbolProyect",
  description:
    "Promote your club, academy, sports brand, event, or service to players, agents, scouts, and clubs on FutbolProyect.",
  alternates: {
    canonical: "/publicidad",
  },
};

export default function AdvertisingPage() {
  return <AdvertisingPageClient />;
}
