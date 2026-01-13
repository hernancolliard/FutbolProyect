// futbolproyect-nextjs/src/components/Hero.tsx
// This is a Server Component.
import React from 'react';
import { getTranslation } from '@/lib/i18n-server';
import ParallaxHero from './client-components/ParallaxHero'; // Import the Client Component

const Hero = async () => {
  const { translations } = await getTranslation('es'); // Fetch translations on the server

  return (
    <ParallaxHero
      heroTitle={translations.hero_title}
      heroSubtitle={translations.hero_subtitle}
    />
  );
};

export default Hero;
