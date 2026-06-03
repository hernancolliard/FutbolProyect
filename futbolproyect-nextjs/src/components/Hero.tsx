"use client";
import React from 'react';
import Link from 'next/link';
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import ParallaxHero from './client-components/ParallaxHero';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <ParallaxHero
      heroTitle={t('hero_title')}
      heroSubtitle={t('hero_subtitle')}
      primaryCta={
        <Button component={Link} href="/all-offers" variant="contained" className="hero-primary-cta">
          {t("hero_primary_cta", "Ver oportunidades")}
        </Button>
      }
      secondaryCta={
        <Button component={Link} href="/perfiles" variant="outlined" className="hero-secondary-cta">
          {t("hero_secondary_cta", "Explorar talentos")}
        </Button>
      }
    />
  );
};

export default Hero;
