
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './FeaturedProfilesPage.css';

const fetchFeaturedProfiles = async () => {
  const { data } = await apiClient.get('/profiles/destacados');
  return data;
};

function FeaturedProfilesPage() {
  const { t } = useTranslation();
  const { data: profiles, isLoading, isError, error } = useQuery({
    queryKey: ['featuredProfiles'],
    queryFn: fetchFeaturedProfiles,
  });

  return (
    <>
      <Helmet>
        <title>{t('featured_profiles_seo_title', 'Perfiles Destacados | FutbolProyect')}</title>
        <meta
          name="description"
          content={t('featured_profiles_seo_desc', 'Descubre a los futbolistas, entrenadores y profesionales destacados en FutbolProyect. Perfiles verificados y con suscripción activa.')}
        />
      </Helmet>
      <div className="featured-profiles-page">
        <h2 className="page-title">{t('featured_profiles_title', 'Perfiles Destacados')}</h2>
        <p className="page-description">{t('featured_profiles_desc', 'Estos son los profesionales que han decidido destacar su perfil en nuestra plataforma.')}</p>

        {isLoading ? (
          <LoadingSpinner text={t('loading_profiles', 'Cargando perfiles...')} />
        ) : isError ? (
          <div className="error-message">
            {t('error_loading_profiles', 'Hubo un error al cargar los perfiles:')} {error.message}
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles && profiles.length > 0 ? (
              profiles.map((profile) => (
                <div key={profile.id} className="profile-card">
                  <Link to={`/profile/${profile.id}`} className="profile-card-link">
                    <img
                      src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                      alt={`Perfil de ${profile.nombre} ${profile.apellido}`}
                      className="profile-image"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/logos/logofp.png'; }}
                    />
                    <div className="profile-info">
                      <h3 className="profile-name">{`${profile.nombre} ${profile.apellido}`}</h3>
                      <p className="profile-detail">{t('position', 'Posición')}: {profile.posicion_principal || t('not_specified', 'No especificada')}</p>
                      <p className="profile-detail">{t('nationality', 'Nacionalidad')}: {profile.nacionalidad || t('not_specified', 'No especificada')}</p>
                    </div>
                  </Link>
                  <Link to={`/profile/${profile.id}`} className="profile-view-button">
                    {t('view_profile', 'Ver Perfil')}
                  </Link>
                </div>
              ))
            ) : (
              <p>{t('no_featured_profiles', 'De momento no hay perfiles destacados.')}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default FeaturedProfilesPage;
