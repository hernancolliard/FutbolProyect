// futbolproyect-nextjs/src/app/empleo-entrenadores-futbol/page.tsx
import { Metadata } from "next";
import React from "react";
import { Offer } from "@/lib/types";
import SeoPage from "@/components/shared/SeoPage"; // Adjust path
import OfferList from "@/components/shared/OfferList"; // Adjust path
import { getTranslation } from "@/lib/i18n-server"; // Adjust path
export const dynamic = "force-dynamic";
// Function to fetch offers for coaches
async function getCoachOffers(): Promise<Offer[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  const res = await fetch(`${apiBaseUrl}/offers?puesto=entrenador`, {
    next: { revalidate: 3600 },
  }); // Filter by position
  if (!res.ok) {
    throw new Error("Failed to fetch coach offers");
  }
  const data = await res.json();
  return data.offers || [];
}

// Generate metadata for the page
export async function generateMetadata(): Promise<Metadata> {
  const { translations } = await getTranslation("es"); // Fetch translations for metadata
  return {
    title:
      translations["empleo_entrenadores_futbol_seo_title"] ||
      "Empleo para entrenadores de fútbol | Oportunidades en clubes",
    description:
      translations["empleo_entrenadores_futbol_seo_desc"] ||
      "Encontrá empleo para entrenadores de fútbol en clubes y academias. Publicá tu perfil y accedé a nuevas oportunidades laborales.",
  };
}

const EmpleoEntrenadoresFutbolPage = async () => {
  const { translations } = await getTranslation("es"); // Fetch translations for page content
  const offers = await getCoachOffers();

  const pageContent = {
    h1:
      translations["empleo_entrenadores_futbol_h1"] ||
      "Empleo para entrenadores de fútbol",
    mainText:
      translations["empleo_entrenadores_futbol_main_text"] ||
      `Los entrenadores de fútbol cumplen un rol central en el desarrollo deportivo de jugadores y equipos. En FutbolProyect creamos un espacio específico donde entrenadores y cuerpos técnicos pueden encontrar oportunidades laborales en clubes y academias.

Esta sección está pensada para entrenadores principales, asistentes, formadores juveniles y técnicos especializados. Los clubes pueden buscar perfiles según experiencia, categoría, licencias y objetivos deportivos, facilitando un proceso de selección más eficiente.

Si sos entrenador y estás buscando crecer profesionalmente, contar con un perfil visible en una plataforma dedicada al fútbol aumenta significativamente tus posibilidades. FutbolProyect conecta talento con proyectos deportivos reales.`,
    h2:
      translations["empleo_entrenadores_futbol_h2"] ||
      "Trabajo para entrenadores de fútbol",
    ctaText:
      translations["empleo_entrenadores_futbol_cta"] ||
      "Registrate y accedé a empleo para entrenadores de fútbol",
    ctaLink: "/register",
  };

  return (
    <SeoPage
      {...pageContent}
      items={offers}
      renderItems={(items) => (
        <OfferList offers={items as Offer[]} isHomePage={false} />
      )}
    />
  );
};

export default EmpleoEntrenadoresFutbolPage;
