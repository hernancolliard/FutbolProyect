"use client";
import React from 'react';
import Image from 'next/image';
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  const aboutImageWebp = '/images/nosotros.webp';

  return (
      <div className="info-section">
        <div className="info-image">
          <Image
            src={aboutImageWebp}
            alt={t('about_us_title')}
            width={500}
            height={300}
          />
        </div>
        <div className="info-text">
          <h2>{t('about_us_title')}</h2>
          <p>
            {t('about_us_text')}
          </p>
        </div>
      </div>
  );
}

export default About;
