'use client';

import React, { useState, useEffect } from 'react';
import { ParallaxBanner } from 'react-scroll-parallax';
// No need to import image paths here, they will be passed as props

interface ParallaxHeroProps {
  heroTitle: string;
  heroSubtitle: string;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ heroTitle, heroSubtitle }) => {
  // Original logic for high-res/low-res image loading, if still needed.
  // For simplicity, directly using high-res for now, assuming Next.js handles it.
  const heroBackgroundImage = "/images/fondo_1.webp";
  const heroLowResBackgroundImage = "/images/fondo_1_lowres.webp"; // If you still want to use it
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
    translateY: [0, 30],
    shouldAlwaysCompleteAnimation: true,
    children: (
      <div className="hero-content">
        <h1>{heroTitle}</h1>
        <p>{heroSubtitle}</p>
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
