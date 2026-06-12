'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box, Paper, Chip, Stack, Rating } from '@mui/material';
import { Profile } from '@/lib/types';

interface ProfileCardProps {
    profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
    const { t } = useTranslation();

    const profileImageUrl = profile.foto_perfil_url || '/images/logos/logofp.png';
    const hasStrongProfile = Boolean(profile.foto_perfil_url && profile.cv_url);

    return (
        <Paper
            elevation={2}
            sx={{
                overflow: 'hidden',
                textAlign: 'center',
                height: '100%',
                border: hasStrongProfile ? '1px solid rgba(25, 38, 52, 0.16)' : '1px solid rgba(25, 38, 52, 0.08)',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 14px 30px rgba(17, 24, 39, 0.1)',
                },
            }}
        >
            <Link href={`/profile/${profile.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box>
                    <Image
                        src={profileImageUrl}
                        alt={`Perfil de ${profile.nombre} ${profile.apellido || ''}`}
                        width={180}
                        height={180}
                        style={{
                            width: '100%',
                            height: '180px',
                            objectFit: 'contain',
                        }}
                        onError={(e) => (e.currentTarget.src = '/images/logos/logofp.png')}
                    />
                    <Box sx={{ padding: '1rem' }}>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            {hasStrongProfile && (
                                <Chip size="small" color="primary" variant="outlined" label={t('profile_complete_badge', 'Perfil completo')} />
                            )}
                            {profile.nacionalidad && (
                                <Chip size="small" variant="outlined" label={profile.nacionalidad} />
                            )}
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{`${profile.nombre} ${profile.apellido || ''}`}</Typography>
                        <Typography variant="body2">{profile.posicion_principal || t('not_specified', 'No especificada')}</Typography>
                        {profile.average_rating > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', mt: 1 }}>
                                <Rating size="small" value={profile.average_rating} readOnly precision={0.5} />
                                <Typography variant="caption" color="text.secondary">
                                    ({profile.total_ratings || 0})
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Link>
            <Button
                component={Link}
                href={`/profile/${profile.id}`}
                variant="outlined"
                sx={{ mb: 2 }}
            >
                {t('view_profile', 'Ver Perfil')}
            </Button>
        </Paper>
    );
}
