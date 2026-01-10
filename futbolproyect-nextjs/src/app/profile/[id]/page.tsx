import { type Metadata } from 'next';
import { getTranslation } from '@/lib/i18n-server';
import { Profile } from '@/lib/types';
import ProfilePageClient from '@/components/profile/ProfilePageClient'; // This will be the client component

const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    try {
        const res = await fetch(`${apiUrl}/api/profiles/${userId}`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            // Log error but return null to handle it gracefully in the component
            console.error(`Failed to fetch profile for user ${userId}: ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`Network error fetching profile for user ${userId}:`, error);
        return null;
    }
};

export async function generateMetadata({ params, searchParams }: { params: { id: string }, searchParams: { lang?: string } }): Promise<Metadata> {
    const { t } = await getTranslation(searchParams?.lang);
    const profile = await fetchProfile(params.id);

    if (!profile) {
        return {
            title: t('profile_not_found', 'Perfil no encontrado'),
        };
    }

    const lang = searchParams?.lang === 'en' ? 'en' : 'es';
    const resumen_profesional = profile[`resumen_profesional_${lang}`] || profile.resumen_profesional;
    const posicion_principal = profile[`posicion_principal_${lang}`] || profile.posicion_principal;

    const seoTitle = `${profile.nombre || ""} ${profile.apellido || ""}${posicion_principal ? ` - ${posicion_principal}` : ""} | FutbolProyect`;
    const seoDescription = resumen_profesional
        ? resumen_profesional.substring(0, 160)
        : `Perfil de ${profile.nombre || ""} ${profile.apellido || ""} en FutbolProyect. Explora estadísticas, videos y trayectoria profesional.`;
    
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${profile.id}`;

    return {
        title: seoTitle,
        description: seoDescription,
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            type: 'profile',
            url: url,
            images: [
                {
                    url: profile.foto_perfil_url || '/images/logos/logofp.png',
                    alt: `Perfil de ${profile.nombre} ${profile.apellido || ''}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: seoTitle,
            description: seoDescription,
            images: [profile.foto_perfil_url || '/images/logos/logofp.png'],
        },
    };
}


export default async function ProfilePage({ params }: { params: { id: string } }) {
    const profile = await fetchProfile(params.id);

    // We pass the fetched profile to the client component
    return <ProfilePageClient profile={profile} />;
}
