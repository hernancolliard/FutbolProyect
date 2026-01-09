import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import SeoPage from './SeoPage';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import OfferList from './OfferList'; // Reusing OfferList for offers

const fetchCoachOffers = async () => {
  // Assuming the API can filter by position or a keyword
  const { data } = await apiClient.get('/offers?puesto=entrenador'); 
  return data.offers;
};

const EmpleoEntrenadoresFutbolPage = () => {
  const { t } = useTranslation();
  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ['coachOffers'],
    queryFn: fetchCoachOffers,
  });

  const pageContent = {
    title: "Empleo para entrenadores de fútbol | Oportunidades en clubes",
    metaDescription: "Encontrá empleo para entrenadores de fútbol en clubes y academias. Publicá tu perfil y accedé a nuevas oportunidades laborales.",
    h1: "Empleo para entrenadores de fútbol",
    mainText: `Los entrenadores de fútbol cumplen un rol central en el desarrollo deportivo de jugadores y equipos. En FutbolProyect creamos un espacio específico donde entrenadores y cuerpos técnicos pueden encontrar oportunidades laborales en clubes y academias.

Esta sección está pensada para entrenadores principales, asistentes, formadores juveniles y técnicos especializados. Los clubes pueden buscar perfiles según experiencia, categoría, licencias y objetivos deportivos, facilitando un proceso de selección más eficiente.

Si sos entrenador y estás buscando crecer profesionalmente, contar con un perfil visible en una plataforma dedicada al fútbol aumenta significativamente tus posibilidades. FutbolProyect conecta talento con proyectos deportivos reales.`,
    h2: "Trabajo para entrenadores de fútbol",
    ctaText: "Registrate y accedé a empleo para entrenadores de fútbol",
    ctaLink: "/register"
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>{t('error_loading_offers')}</div>;
  }

  return (
    <SeoPage 
      {...pageContent}
      items={offers} // Pass offers as items
      renderItems={(items) => <OfferList offers={items} isHomePage={false} />} // Pass OfferList as renderItems
    />
  );
};

export default EmpleoEntrenadoresFutbolPage;
