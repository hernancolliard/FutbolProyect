"use client";
import React from 'react';
import { useTranslation } from "react-i18next";
import ParallaxHero from './client-components/ParallaxHero';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <ParallaxHero
      heroTitle={t('hero_title')}
      heroSubtitle={t('hero_subtitle')}
    />
  );
};

export default Hero;
