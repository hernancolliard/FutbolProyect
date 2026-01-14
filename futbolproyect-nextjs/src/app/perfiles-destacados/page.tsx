import { Suspense } from 'react';
import { type Metadata } from 'next';
import { getTranslation } from '@/lib/i18n-server';
import { Profile } from '@/lib/types';
import { Grid, Typography, Paper } from '@mui/material';
import FilterControls from '@/components/profile/FilterControls';
import ProfileCard from '@/components/profile/ProfileCard';

const fetchFeaturedProfiles = async (filters: { nacionalidad?: string; puesto?: string; }): Promise<Profile[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    // a query string is created from the filters object
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await fetch(`${apiUrl}/api/profiles/destacados?${query}`, { next: { revalidate: 3600 } }); // revalidate every hour
    if (!res.ok) {
      // In a real app, you'd handle this more gracefully
      console.error('Failed to fetch profiles');
      return [];
    }
    return res.json();
};

const fetchNacionalidades = async (): Promise<string[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/profiles/nacionalidades`, { next: { revalidate: 86400 } }); // revalidate once a day
    if (!res.ok) return [];
    return res.json();
};

const fetchPuestos = async (): Promise<string[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/profiles/puestos`, { next: { revalidate: 86400 } }); // revalidate once a day
    if (!res.ok) return [];
    return res.json();
};


export async function generateMetadata({ searchParams } : { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
    const { t } = await getTranslation(searchParams?.lang as string);
    return {
        title: t('featured_profiles_seo_title'),
        description: t('featured_profiles_seo_desc'),
    };
}

// A separate component for the main content to wrap it in Suspense
async function ProfilesList({ nacionalidad, puesto, lang }: { nacionalidad?: string; puesto?: string; lang?:string}) {
    const profiles = await fetchFeaturedProfiles({ nacionalidad, puesto });
    const { t } = await getTranslation(lang);

    if (profiles.length === 0) {
        return <Typography>{t('no_featured_profiles_filters')}</Typography>
    }

    return (
        <Grid container spacing={3} sx={{mt: 2}}>
            {profiles.map((profile) => (
                <Grid item key={profile.id} xs={12} sm={6} md={4} lg={3}>
                    <ProfileCard profile={profile} />
                </Grid>
            ))}
        </Grid>
    );
}

export default async function FeaturedProfilesPage({
    searchParams,
}: {
    searchParams: { nacionalidad?: string; puesto?: string; lang?: string };
}) {
    const { t } = await getTranslation(searchParams?.lang);
    const [nacionalidades, puestos] = await Promise.all([
        fetchNacionalidades(),
        fetchPuestos()
    ]);

    const { nacionalidad, puesto, lang } = searchParams;

    return (
        <Paper sx={{ p: {xs: 2, md: 4}, m: {xs: 1, md: 2} }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {t('featured_profiles_title')}
            </Typography>
            <Typography paragraph>
                {t('featured_profiles_desc')}
            </Typography>

            <FilterControls
                nacionalidades={nacionalidades}
                puestos={puestos}
                initialFilters={{ nacionalidad, puesto }}
            />

            <Suspense fallback={<Typography>{t('loading_profiles')}</Typography>}>
                <ProfilesList nacionalidad={nacionalidad} puesto={puesto} lang={lang} />
            </Suspense>
        </Paper>
    );
}
