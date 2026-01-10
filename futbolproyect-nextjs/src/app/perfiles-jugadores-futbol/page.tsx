// futbolproyect-nextjs/src/app/perfiles-jugadores-futbol/page.tsx
import React from 'react';
import SeoPage from '../../components/shared/SeoPage'; // Adjust path
import ProfileList from '../../components/shared/ProfileList'; // Adjust path
import { getTranslation } from '../../../lib/i18n-server'; // Adjust path
import { Metadata } from 'next'; // Import Metadata

// Define types for Profile (re-using the one from ProfileList.tsx for consistency)
interface Profile {
    id: string;
    foto_perfil_url?: string;
    nombre: string;
    apellido?: string;
    posicion_principal?: string;
    nacionalidad?: string;
    // Add other profile properties as needed
}

// Function to fetch profiles
async function getProfiles(): Promise<Profile[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const res = await fetch(`${apiBaseUrl}/profiles`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error('Failed to fetch profiles');
  }
  return res.json();
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslation('es'); // Fetch translations for metadata
  return {
    title: translations['perfiles_jugadores_futbol_seo_title'],
    description: translations['perfiles_jugadores_futbol_seo_desc'],
  };
}

const PerfilesJugadoresFutbolPage = async () => {
  const translations = await getTranslation('es'); // Fetch translations for page content
  const profiles = await getProfiles();

  const pageContent = {
    h1: translations['perfiles_jugadores_futbol_h1'],
    mainText: translations['perfiles_jugadores_futbol_main_text'],
    h2: translations['perfiles_jugadores_futbol_h2'],
    ctaText: translations['perfiles_jugadores_futbol_cta'],
    ctaLink: "/register"
  };

  return (
    <SeoPage 
      {...pageContent}
      items={profiles}
      renderItems={(items) => <ProfileList profiles={items as Profile[]} />}
    />
  );
};

export default PerfilesJugadoresFutbolPage;
