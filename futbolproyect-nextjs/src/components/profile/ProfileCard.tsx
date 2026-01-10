'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Typography, Button, Box, Paper } from '@mui/material';
import { Profile } from '@/lib/types';

interface ProfileCardProps {
    profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
    const { t } = useTranslation();

    const profileImageUrl = profile.foto_perfil_url || '/images/logos/logofp.png';

    return (
        <Paper elevation={2} sx={{ overflow: 'hidden', textAlign: 'center' }}>
            <Link href={`/profile/${profile.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box>
                    <Image
                        src={profileImageUrl}
                        alt={`Perfil de ${profile.nombre} ${profile.apellido || ''}`}
                        width={180}
                        height={180}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        onError={(e) => (e.currentTarget.src = '/images/logos/logofp.png')}
                    />
                    <Box sx={{ padding: '1rem' }}>
                        <Typography variant="h6">{`${profile.nombre} ${profile.apellido || ''}`}</Typography>
                        <Typography variant="body2">{profile.posicion_principal || t('not_specified', 'No especificada')}</Typography>
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
