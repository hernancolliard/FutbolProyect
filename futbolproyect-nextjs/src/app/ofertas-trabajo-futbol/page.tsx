// futbolproyect-nextjs/src/app/ofertas-trabajo-futbol/page.tsx
import { Metadata } from 'next';
import React from 'react';
import { Offer } from '@/lib/types';
import SeoPage from '@/components/shared/SeoPage'; // Adjust path
import OfferList from '@/components/shared/OfferList'; // Adjust path
import { getTranslation } from '@/lib/i18n-server'; // Adjust path

// Function to fetch offers
async function getOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const res = await fetch(`${apiBaseUrl}/offers`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch offers');
  }
  const data = await res.json();
  return data.offers || [];
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getTranslation('es'); // Fetch translations for metadata
  return {
    title: translations['ofertas_trabajo_futbol_seo_title'],
    description: translations['ofertas_trabajo_futbol_seo_desc'],
  };
}

const OfertasTrabajoFutbolPage = async () => {
  const { translations } = await getTranslation('es'); // Fetch translations for page content
  const offers = await getOffers();

  const pageContent = {
    h1: translations['ofertas_trabajo_futbol_h1'],
    mainText: translations['ofertas_trabajo_futbol_main_text'],
    h2: translations['ofertas_trabajo_futbol_h2'],
    ctaText: translations['ofertas_trabajo_futbol_cta'],
    ctaLink: "/register"
  };

  return (
    <SeoPage 
      {...pageContent}
      items={offers}
      renderItems={(items) => <OfferList offers={items} isHomePage={false} />}
    />
  );
};

export default OfertasTrabajoFutbolPage;
