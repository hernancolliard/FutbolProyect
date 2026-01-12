'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel, Button, Grid, Typography, Box, SelectChangeEvent } from '@mui/material';
import LoadingSpinner from '@/components/LoadingSpinner'; // Corrected path
import apiClient from '@/lib/apiClient'; // Corrected path

const fetchFeaturedProfiles = async (filters: { nacionalidad: string; puesto: string; }) => {
  const { data } = await apiClient.get('/profiles/destacados', { params: filters });
  return data;
};

const fetchNacionalidades = async () => {
  const { data } = await apiClient.get('/profiles/nacionalidades');
  return data;
};

const fetchPuestos = async () => {
  const { data } = await apiClient.get('/profiles/puestos');
  return data;
};

export default function FeaturedProfilesClient() {
  const { t } = useTranslation('common');
  const [filters, setFilters] = useState({ nacionalidad: '', puesto: '' });

  const { data: profiles, isLoading, isError, error } = useQuery<any[], Error>({
    queryKey: ['featuredProfiles', filters],
    queryFn: () => fetchFeaturedProfiles(filters),
  });

  const { data: nacionalidades, isLoading: isLoadingNacionalidades } = useQuery<string[]>({
    queryKey: ['nacionalidades'],
    queryFn: fetchNacionalidades,
  });

  const { data: puestos, isLoading: isLoadingPuestos } = useQuery<string[]>({
    queryKey: ['puestos'],
    queryFn: fetchPuestos,
  });

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ nacionalidad: '', puesto: '' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
        {t('featured_profiles_title', 'Perfiles Destacados')}
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
        {t('featured_profiles_desc', 'Estos son los profesionales que han decidido destacar su perfil en nuestra plataforma.')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'white' }}>{t('filter_by_nationality', 'Filtrar por nacionalidad')}</InputLabel>
            <Select
              name="nacionalidad"
              value={filters.nacionalidad}
              onChange={handleFilterChange}
              label={t('filter_by_nationality', 'Filtrar por nacionalidad')}
              disabled={isLoadingNacionalidades}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="">
                <em>{t('all_nationalities', 'Todas')}</em>
              </MenuItem>
              {nacionalidades?.map((nac) => (
                <MenuItem key={nac} value={nac}>
                  {nac}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'white' }}>{t('filter_by_position', 'Filtrar por puesto')}</InputLabel>
            <Select
              name="puesto"
              value={filters.puesto}
              onChange={handleFilterChange}
              label={t('filter_by_position', 'Filtrar por puesto')}
              disabled={isLoadingPuestos}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="">
                <em>{t('all_positions', 'Todos')}</em>
              </MenuItem>
              {puestos?.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" onClick={clearFilters} fullWidth sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}>{t('clear_filters', 'Limpiar')}</Button>
        </Grid>
      </Grid>

      {isLoading ? (
        <LoadingSpinner text="Cargando perfiles..." />
      ) : isError ? (
        <Box className="error-message" sx={{ color: 'red', mt: 2 }}>
          {t('error_loading_profiles', 'Hubo un error al cargar los perfiles:')} {error?.message}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {profiles && profiles.length > 0 ? (
            profiles.map((profile: any) => (
              <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
                <Box
                  className="profile-card"
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    textAlign: 'center',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                  }}
                >
                  <Link href={`/profile/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Image
                      src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                      alt={`Perfil de ${profile.nombre} ${profile.apellido}`}
                      width={180}
                      height={180}
                      style={{ width: '100%', height: '180px', objectFit: 'contain' }}
                    />
                    <Box className="profile-info" sx={{ p: 1 }}>
                      <Typography variant="h6" className="profile-name" sx={{ color: 'white' }}>
                        {`${profile.nombre} ${profile.apellido}`}
                      </Typography>
                      <Typography variant="body2" className="profile-detail" sx={{ color: '#bdbdbd' }}>
                        {t('position', 'Posición')}: {profile.posicion_principal || t('not_specified', 'No especificada')}
                      </Typography>
                      <Typography variant="body2" className="profile-detail" sx={{ color: '#bdbdbd' }}>
                        {t('nationality', 'Nacionalidad')}: {profile.nacionalidad || t('not_specified', 'No especificada')}
                      </Typography>
                    </Box>
                  </Link>
                  <Button
                    component={Link}
                    href={`/profile/${profile.id}`}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {t('view_profile', 'Ver Perfil')}
                  </Button>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography sx={{ mt: 2, ml: 2, color: 'white' }}>
              {t('no_featured_profiles_filters', 'No hay perfiles destacados que coincidan con los filtros seleccionados.')}
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}
