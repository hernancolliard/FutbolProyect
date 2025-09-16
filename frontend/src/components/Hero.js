import React, { useState, useEffect } from "react";
import "./Hero.css";
import { useTranslation } from "react-i18next";
import { ParallaxBanner } from "react-scroll-parallax";
import heroBackgroundImage from "../images/fondo_1.webp";
import heroLowResBackgroundImage from "../images/fondo_1_lowres.webp"; // Assuming a low-res version exists

const Hero = () => {
  const { t } = useTranslation();
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
    className: highResImageLoaded ? "hero-background-loaded" : "hero-background-loading",
  };

  const headline = {
    translateY: [0, 30],
    shouldAlwaysCompleteAnimation: true,
    children: (
      <div className="hero-content">
        <h1>{t("hero_title")}</h1>
        <p>{t("hero_subtitle")}</p>
      </div>
    ),
  };

  return (
    <div className="hero-container">
      <ParallaxBanner layers={[background, headline]} className="hero-banner" />
    </div>
  );
};

export default Hero;
