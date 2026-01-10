// futbolproyect-nextjs/src/app/page.tsx
import { Metadata } from 'next';
import React from 'react';
import { getTranslation } from '../../lib/i18n-server';
import Hero from '../components/Hero';
import TrustedBy from '../components/shared/TrustedBy';
import OfferList from '../components/shared/OfferList';
import FeaturedProfilesCarousel from '../components/shared/FeaturedProfilesCarousel'; // Import the new Client Component

// Define metadata for the home page

// Define metadata for the home page
export const metadata: Metadata = {
  title: 'FutbolProyect | Conectando Talentos del Fútbol', // From old Hero.js
  description: 'Encuentra tu próxima oportunidad en el mundo del fútbol. FutbolProyect conecta a futbolistas, entrenadores, ojeadores y clubes. ¡Explora ofertas de empleo y perfiles de talento hoy!', // From old Hero.js
};

async function getHomePageOffers() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const res = await fetch(`${apiBaseUrl}/offers?limit=6`, { next: { revalidate: 3600 } }); // Revalidate every hour
  if (!res.ok) {
    throw new Error('Failed to fetch home page offers');
  }
  const data = await res.json();
  return [...(data.featuredOffers || []), ...(data.offers || [])];
}

// Async function to fetch featured profiles data
async function getFeaturedProfiles() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const res = await fetch(`${apiBaseUrl}/profiles/destacados`, { next: { revalidate: 3600 } }); // Revalidate every hour
  if (!res.ok) {
    throw new Error('Failed to fetch featured profiles');
  }
  return res.json();
}

// Mock components for now. These will be migrated properly later.
// Defined outside the main component.

// Removed mock TrustedBy component.
export default async function HomePage() {
  const translations = await getTranslation('es'); // Fetch translations for 'es' locale

  let homePageOffers = [];
  try {
    homePageOffers = await getHomePageOffers();
  } catch (error) {
    console.error("Error fetching home page offers:", error);
    // You might want to display an error message on the page or fallback content
  }

  let featuredProfiles = [];
  try {
    featuredProfiles = await getFeaturedProfiles();
  } catch (error) {
    console.error("Error fetching featured profiles:", error);
  }

  return (
    <main>
      <Hero />
      <TrustedBy />
      <OfferList offers={homePageOffers} isHomePage={true} />
      <FeaturedProfilesCarousel profiles={featuredProfiles} /> {/* Use actual component with data */}
      <About />
      <Mission />
      <ContactSummary />
    </main>
  );
}
