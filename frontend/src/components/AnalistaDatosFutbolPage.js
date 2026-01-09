import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import SeoPage from './SeoPage';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';

const fetchAnalystOffers = async () => {
  // Assuming the API can filter by position or a keyword
  const { data } = await apiClient.get('/offers?puesto=analista'); 
  return data.offers;
};

const AnalistaDatosFutbolPage = () => {
  const { t } = useTranslation();
  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ['analystOffers'],
    queryFn: fetchAnalystOffers,
  });

  const pageContent = {
    title: "Trabajo para analista de datos en el fútbol | FutbolProyect",
    metaDescription: "Descubrí oportunidades de trabajo para analistas de datos en el fútbol. Clubes y academias buscan profesionales en análisis deportivo.",
    h1: "Trabajo para analista de datos en el fútbol",
    mainText: `El rol del analista de datos en el fútbol se volvió fundamental en clubes y academias de todos los niveles. El uso de estadísticas, métricas de rendimiento y análisis táctico permite tomar mejores decisiones deportivas, por lo que la demanda de estos perfiles crece año a año.

En FutbolProyect reunimos ofertas de trabajo para analistas de datos de fútbol, orientadas tanto a profesionales con experiencia como a perfiles junior que buscan su primera oportunidad en el deporte. Las vacantes pueden estar vinculadas al análisis de partidos, scouting, rendimiento físico o apoyo al cuerpo técnico.

Si tenés conocimientos en herramientas como Excel, SQL, Power BI, Python o software de análisis futbolístico, esta sección es ideal para vos. Los clubes buscan perfiles capaces de transformar datos en información útil para mejorar el rendimiento deportivo.`,
    h2: "Clubes que buscan analistas de datos",
    ctaText: "Creá tu perfil y postulá a trabajos como analista de datos en el fútbol",
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

export default AnalistaDatosFutbolPage;
