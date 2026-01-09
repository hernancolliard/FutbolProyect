import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import SeoPage from './SeoPage';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

const fetchAllOffers = async () => {
  const { data } = await apiClient.get('/offers');
  return data.offers; // Assuming the API returns { offers: [...] }
};

const OfertasTrabajoFutbolPage = () => {
  const { t } = useTranslation();
  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ['allOffersForSeoPage'],
    queryFn: fetchAllOffers,
  });

  const pageContent = {
    title: "Ofertas de trabajo en el fútbol | Empleo en clubes y academias",
    metaDescription: "Encontrá las mejores ofertas de trabajo en el fútbol. Oportunidades para jugadores, entrenadores, analistas y scouts en clubes y academias.",
    h1: "Ofertas de trabajo en el fútbol",
    mainText: `FutbolProyect es una plataforma especializada en ofertas de trabajo en el fútbol, creada para conectar a clubes, academias y organizaciones deportivas con jugadores y profesionales del fútbol de todo el mundo. Nuestro objetivo es facilitar el acceso a oportunidades laborales reales dentro del ámbito futbolístico, tanto a nivel amateur como profesional.

En esta sección vas a encontrar ofertas de empleo en clubes de fútbol, academias formativas y proyectos deportivos que buscan incorporar talento en distintas áreas. Desde posiciones para jugadores y entrenadores, hasta vacantes para analistas de datos, preparadores físicos, scouts y personal técnico.

El fútbol ofrece cada vez más salidas laborales, y contar con un espacio centralizado donde se publiquen estas oportunidades es clave para quienes desean desarrollarse profesionalmente. En FutbolProyect trabajamos para que las ofertas sean claras, actualizadas y orientadas a perfiles reales del ecosistema futbolístico.`,
    h2: "Publicá y encontrá ofertas de trabajo en el fútbol",
    ctaText: "Registrate gratis y accedé a nuevas ofertas de trabajo en el fútbol",
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
      offers={offers}
    />
  );
};

export default OfertasTrabajoFutbolPage;
