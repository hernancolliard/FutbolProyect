// futbolproyect-nextjs/src/app/perfiles-jugadores-futbol/page.tsx
import { Metadata } from 'next';
import React from 'react';
import SeoPage from '../../components/shared/SeoPage'; // Adjust path
import ProfileList from '../../components/shared/ProfileList'; // Adjust path
import { getTranslation } from '../../../lib/i18n-server'; // Adjust path

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
    title: translations['perfiles_jugadores_futbol_seo_title'] || "Perfiles de jugadores de fútbol | Mostrá tu talento a clubes",
    description: translations['perfiles_jugadores_futbol_seo_desc'] || "Explorá perfiles de jugadores de fútbol y mostrá tu trayectoria a clubes y academias. Creá tu perfil y aumentá tus oportunidades.",
  };
}

const PerfilesJugadoresFutbolPage = async () => {
  const translations = await getTranslation('es'); // Fetch translations for page content
  const profiles = await getProfiles();

  const pageContent = {
    h1: translations['perfiles_jugadores_futbol_h1'] || "Perfiles de jugadores de fútbol",
    mainText: translations['perfiles_jugadores_futbol_main_text'] || `En FutbolProyect los jugadores de fútbol tienen un espacio para crear y mostrar su perfil deportivo de manera profesional. Esta sección reúne perfiles de jugadores de distintas edades, posiciones y niveles competitivos, facilitando el contacto directo con clubes, entrenadores y reclutadores.

Contar con un perfil bien presentado es clave para aumentar las oportunidades dentro del fútbol. En tu perfil podés incluir información relevante como posición, experiencia, estadísticas, videos y objetivos deportivos. De esta forma, los clubes pueden evaluar tu potencial de manera rápida y clara.

Nuestro objetivo es reducir la distancia entre jugadores y oportunidades reales. Ya seas juvenil, amateur o profesional, tener presencia en una plataforma especializada en fútbol te permite ganar visibilidad y acceder a nuevas posibilidades.`,
    h2: translations['perfiles_jugadores_futbol_h2'] || "Oportunidades para jugadores en el fútbol",
    ctaText: translations['perfiles_jugadores_futbol_cta'] || "Creá tu perfil como jugador y mostrate ante clubes de fútbol",
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
