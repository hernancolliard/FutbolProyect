import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import SeoPage from './SeoPage';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import ProfileList from './ProfileList'; // Import ProfileList

const fetchAllProfiles = async () => {
  const { data } = await apiClient.get('/profiles'); 
  return data; // Assuming the API returns a list of profiles directly
};

const PerfilesJugadoresFutbolPage = () => {
  const { t } = useTranslation();
  const { data: profiles, isLoading, isError } = useQuery({
    queryKey: ['allProfilesForSeoPage'],
    queryFn: fetchAllProfiles,
  });

  const pageContent = {
    title: "Perfiles de jugadores de fútbol | Mostrá tu talento a clubes",
    metaDescription: "Explorá perfiles de jugadores de fútbol y mostrá tu trayectoria a clubes y academias. Creá tu perfil y aumentá tus oportunidades.",
    h1: "Perfiles de jugadores de fútbol",
    mainText: `En FutbolProyect los jugadores de fútbol tienen un espacio para crear y mostrar su perfil deportivo de manera profesional. Esta sección reúne perfiles de jugadores de distintas edades, posiciones y niveles competitivos, facilitando el contacto directo con clubes, entrenadores y reclutadores.

Contar con un perfil bien presentado es clave para aumentar las oportunidades dentro del fútbol. En tu perfil podés incluir información relevante como posición, experiencia, estadísticas, videos y objetivos deportivos. De esta forma, los clubes pueden evaluar tu potencial de manera rápida y clara.

Nuestro objetivo es reducir la distancia entre jugadores y oportunidades reales. Ya seas juvenil, amateur o profesional, tener presencia en una plataforma especializada en fútbol te permite ganar visibilidad y acceder a nuevas posibilidades.`,
    h2: "Oportunidades para jugadores en el fútbol",
    ctaText: "Creá tu perfil como jugador y mostrate ante clubes de fútbol",
    ctaLink: "/register"
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>{t('error_loading_profile')}</div>; // Reusing error message for profiles
  }

  return (
    <SeoPage 
      {...pageContent}
      items={profiles} // Pass profiles as items
      renderItems={(items) => <ProfileList profiles={items} />} // Pass ProfileList as renderItems
    />
  );
};

export default PerfilesJugadoresFutbolPage;
