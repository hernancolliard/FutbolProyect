'use client';

import React from 'react';
import Link from 'next/link'; // Use next/link
import { useTranslation } from 'react-i18next';
import Image from "next/image"; // Use next/image
import { Grid, Typography, Button, Box } from '@mui/material'; // Using Material UI components

// Define types for Profile
interface Profile {
    id: string;
    foto_perfil_url?: string;
    nombre: string;
    apellido?: string;
    posicion_principal?: string;
    nacionalidad?: string;
    // Add other profile properties as needed
}

interface ProfileListProps {
    profiles: Profile[];
}

const ProfileList = ({ profiles }: ProfileListProps) => {
  const { t } = useTranslation();

  if (!profiles || profiles.length === 0) {
    return <Typography>{t('no_profiles_available', 'No hay perfiles disponibles.')}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {profiles.map((profile) => (
        <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
          <Box className="profile-card" sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', textAlign: 'center' }}>
            <Link href={`/profile/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Image
                src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                alt={`Perfil de ${profile.nombre} ${profile.apellido || ''}`}
                width={180} // Assuming fixed size for consistency
                height={180} // Assuming fixed size for consistency
                style={{ width: '100%', height: '180px', objectFit: 'contain' }}
              />
              <Box className="profile-info" sx={{ padding: '1rem' }}>
                <Typography variant="h6" className="profile-name">{`${profile.nombre} ${profile.apellido || ''}`}</Typography>
                <Typography variant="body2" className="profile-detail">{profile.posicion_principal || t('not_specified', 'No especificada')}</Typography>
              </Box>
            </Link>
            <Button
              component={Link}
              href={`/profile/${profile.id}`} // Use href for next/link
              variant="outlined"
              sx={{ mb: 1 }}
            >
              {t('view_profile', 'Ver Perfil')}
            </Button>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileList;
