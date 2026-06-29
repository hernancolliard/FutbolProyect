'use client';

import React, { useState, useEffect } from 'react';
import { ParallaxBanner } from 'react-scroll-parallax';
// No need to import image paths here, they will be passed as props

interface ParallaxHeroProps {
  heroTitle: string;
  heroSubtitle: string;
  heroKicker: string;
  primaryCta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  heroTitle,
  heroSubtitle,
  heroKicker,
  primaryCta,
  secondaryCta,
}) => {
  // Original logic for high-res/low-res image loading, if still needed.
  // For simplicity, directly using high-res for now, assuming Next.js handles it.
  const heroBackgroundImage = "/images/estadio-futbol-1.webp";
  const heroLowResBackgroundImage = "/images/estadio-futbol.webp";
  const [highResImageLoaded, setHighResImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = heroBackgroundImage;
    img.onload = () => {
      setHighResImageLoaded(true);
    };
  }, []);

  const background = {
    image: highResImageLoaded ? heroBackgroundImage : heroLowResBackgroundImage,
    speed: -20,
    className:
      highResImageLoaded
        ? "hero-background-loaded"
        : "hero-background-loading",
  };

  const headline = {
    translateY: [0, 30] as [number, number],
    shouldAlwaysCompleteAnimation: true,
    children: (
      <div className="hero-content">
        <span className="hero-kicker">{heroKicker}</span>
        <h1>{heroTitle}</h1>
        <p>{heroSubtitle}</p>
        {(primaryCta || secondaryCta) && (
          <div className="hero-actions">
            {primaryCta}
            {secondaryCta}
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="hero-container">
      <ParallaxBanner layers={[background, headline]} className="hero-banner" />
    </div>
  );
};

export default ParallaxHero;
