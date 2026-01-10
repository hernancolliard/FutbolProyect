// futbolproyect-nextjs/src/app/trabajo-analista-datos-futbol/page.tsx
import { Metadata } from 'next';
import React from 'react';
import SeoPage from '../../components/shared/SeoPage'; // Adjust path
import OfferList from '../../components/shared/OfferList'; // Adjust path
import { getTranslation } from '../../../lib/i18n-server'; // Adjust path

// Define types for Offer (re-using the one from OfferList.tsx for consistency)
interface Offer {
  id: string;
  is_featured: boolean;
  imagen_url?: string;
  titulo_es?: string;
  titulo_en?: string;
  titulo: string; // Fallback
  descripcion_es?: string;
  descripcion_en?: string;
  descripcion: string; // Fallback
  ubicacion_es?: string;
  ubicacion_en?: string;
  ubicacion: string; // Fallback
  puesto_es?: string;
  puesto_en?: string;
  puesto: string; // Fallback
  nombre_ofertante: string;
  // Add other offer properties as needed
}

// Function to fetch offers for data analysts
async function getAnalystOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
  }
  const res = await fetch(`${apiBaseUrl}/offers?puesto=analista`, { next: { revalidate: 3600 } }); // Filter by position
  if (!res.ok) {
    throw new Error('Failed to fetch analyst offers');
  }
  const data = await res.json();
  return data.offers || [];
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslation('es'); // Fetch translations for metadata
  return {
    title: translations['trabajo_analista_datos_futbol_seo_title'] || "Trabajo para analista de datos en el fútbol | FutbolProyect",
    description: translations['trabajo_analista_datos_futbol_seo_desc'] || "Descubrí oportunidades de trabajo para analistas de datos en el fútbol. Clubes y academias buscan profesionales en análisis deportivo.",
  };
}

const TrabajoAnalistaDatosFutbolPage = async () => {
  const translations = await getTranslation('es'); // Fetch translations for page content
  const offers = await getAnalystOffers();

  const pageContent = {
    h1: translations['trabajo_analista_datos_futbol_h1'] || "Trabajo para analista de datos en el fútbol",
    mainText: translations['trabajo_analista_datos_futbol_main_text'] || `El rol del analista de datos en el fútbol se volvió fundamental en clubes y academias de todos los niveles. El uso de estadísticas, métricas de rendimiento y análisis táctico permite tomar mejores decisiones deportivas, por lo que la demanda de estos perfiles crece año a año.

En FutbolProyect reunimos ofertas de trabajo para analistas de datos de fútbol, orientadas tanto a profesionales con experiencia como a perfiles junior que buscan su primera oportunidad en el deporte. Las vacantes pueden estar vinculadas al análisis de partidos, scouting, rendimiento físico o apoyo al cuerpo técnico.

Si tenés conocimientos en herramientas como Excel, SQL, Power BI, Python o software de análisis futbolístico, esta sección es ideal para vos. Los clubes buscan perfiles capaces de transformar datos en información útil para mejorar el rendimiento deportivo.`,
    h2: translations['trabajo_analista_datos_futbol_h2'] || "Clubes que buscan analistas de datos",
    ctaText: translations['trabajo_analista_datos_futbol_cta'] || "Creá tu perfil y postulá a trabajos como analista de datos en el fútbol",
    ctaLink: "/register"
  };

  return (
    <SeoPage 
      {...pageContent}
      items={offers}
      renderItems={(items) => <OfferList offers={items as Offer[]} isHomePage={false} />}
    />
  );
};

export default TrabajoAnalistaDatosFutbolPage;
