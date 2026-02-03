import React from 'react';
import AllOffersClient from '@/components/client-components/AllOffersClient';
export const dynamic = 'force-dynamic';

// SEO Metadata for the page
export const metadata = {
  title: "Buscar Ofertas de Empleo en Fútbol | FutbolProyect",
  description: "Explora todas las ofertas de empleo para futbolistas, entrenadores, ojeadores y staff. Usa nuestros filtros para encontrar tu próximo club o rol en la industria del fútbol en FutbolProyect.",
};

export default function AllOffersPage() {
  return <AllOffersClient />;
}
