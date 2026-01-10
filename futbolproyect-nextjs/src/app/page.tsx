// futbolproyect-nextjs/src/app/page.tsx
import { Metadata } from 'next';
import React from 'react';
import { getTranslation } from '../../lib/i18n-server'; // Import server-side translation helper
import Hero from '../components/Hero'; // Import the new Hero Server Component
import TrustedBy from '../components/shared/TrustedBy'; // Import the new TrustedBy Client Component

// Define metadata for the home page
export const metadata: Metadata = {
  title: 'FutbolProyect | Conectando Talentos del Fútbol', // From old Hero.js
  description: 'Encuentra tu próxima oportunidad en el mundo del fútbol. FutbolProyect conecta a futbolistas, entrenadores, ojeadores y clubes. ¡Explora ofertas de empleo y perfiles de talento hoy!', // From old Hero.js
};

// Async function to fetch data for OfferList
async function getHomePageOffers() {
  // Replace with your actual API endpoint
  // Ensure NEXT_PUBLIC_API_BASE_URL is defined in .env.local
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

// Mock components for now. These will be migrated properly later.
// Defined outside the main component.

// Removed mock TrustedBy component.
const FeaturedProfilesCarousel = () => <section style={{ padding: '20px', textAlign: 'center' }}>Featured Profiles Carousel Section</section>;
const About = () => <section style={{ padding: '20px', textAlign: 'center' }}>About Section</section>;
const Mission = () => <section style={{ padding: '20px', textAlign: 'center' }}>Mission Section</section>;
const ContactSummary = () => <section style={{ padding: '20px', textAlign: 'center' }}>Contact Summary Section</section>;


export default async function HomePage() {
  const translations = await getTranslation('es'); // Fetch translations for 'es' locale

  let homePageOffers = [];
  try {
    homePageOffers = await getHomePageOffers();
  } catch (error) {
    console.error(error);
    // You might want to display an error message on the page or fallback content
  }



  const OfferListMock = ({ offers }) => (
    <section style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{translations.available_offers}</h2>
      {offers.length > 0 ? (
        <ul>
          {offers.map(offer => (
            <li key={offer.id}>{offer.titulo}</li> // Simplified
          ))}
        </ul>
      ) : (
        <p>{translations.no_offers_available}</p>
      )}
    </section>
  );

  return (
    <main>
      <Hero />
      <TrustedBy />
      <OfferListMock offers={homePageOffers} />
      <FeaturedProfilesCarousel />
      <About />
      <Mission />
      <ContactSummary />
    </main>
  );
}
