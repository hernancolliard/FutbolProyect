import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './FeaturedProfilesPage.css';
import { Select, MenuItem, FormControl, InputLabel, Button, Grid } from '@mui/material';

const fetchFeaturedProfiles = async (filters) => {
  const { data } = await apiClient.get('/profiles/destacados', { params: filters });
  return data;
};

const fetchNacionalidades = async () => {
    const { data } = await apiClient.get('/profiles/nacionalidades');
    return data;
}

const fetchPuestos = async () => {
    const { data } = await apiClient.get('/profiles/puestos');
    return data;
}


function FeaturedProfilesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ nacionalidad: '', puesto: '' });

  const { data: profiles, isLoading, isError, error } = useQuery({
    queryKey: ['featuredProfiles', filters],
    queryFn: () => fetchFeaturedProfiles(filters),
  });

  const { data: nacionalidades, isLoading: isLoadingNacionalidades } = useQuery({
      queryKey: ['nacionalidades'],
      queryFn: fetchNacionalidades
  })

  const { data: puestos, isLoading: isLoadingPuestos } = useQuery({
    queryKey: ['puestos'],
    queryFn: fetchPuestos
})

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ nacionalidad: '', puesto: '' });
  };

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

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>{t('filter_by_nationality', 'Filtrar por nacionalidad')}</InputLabel>
              <Select
                name="nacionalidad"
                value={filters.nacionalidad}
                onChange={handleFilterChange}
                label={t('filter_by_nationality', 'Filtrar por nacionalidad')}
                disabled={isLoadingNacionalidades}
              >
                <MenuItem value=""><em>{t('all_nationalities', 'Todas')}</em></MenuItem>
                {nacionalidades?.map(nac => <MenuItem key={nac} value={nac}>{nac}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>{t('filter_by_position', 'Filtrar por puesto')}</InputLabel>
              <Select
                name="puesto"
                value={filters.puesto}
                onChange={handleFilterChange}
                label={t('filter_by_position', 'Filtrar por puesto')}
                disabled={isLoadingPuestos}
              >
                <MenuItem value=""><em>{t('all_positions', 'Todos')}</em></MenuItem>
                {puestos?.map(pos => <MenuItem key={pos} value={pos}>{pos}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="outlined" onClick={clearFilters} fullWidth>{t('clear_filters', 'Limpiar')}</Button>
          </Grid>
        </Grid>

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
              <p>{t('no_featured_profiles_filters', 'No hay perfiles destacados que coincidan con los filtros seleccionados.')}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default FeaturedProfilesPage;
