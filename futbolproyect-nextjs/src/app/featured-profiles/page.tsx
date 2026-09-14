import React from 'react';
import FeaturedProfilesClient from '@/components/client-components/FeaturedProfilesClient';
export const dynamic = 'force-dynamic';

// SEO Metadata for the page
export const metadata = {
  title: 'Perfiles Destacados | FutbolProyect',
  description: 'Descubre a futbolistas, entrenadores y profesionales destacados en FutbolProyect con información deportiva y suscripción activa.',
};

export default function FeaturedProfilesPage() {
  return <FeaturedProfilesClient />;
}
