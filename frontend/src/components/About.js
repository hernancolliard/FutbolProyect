import React from 'react';
import aboutImage from '../images/nosotros.png';
import aboutImageWebp from '../images/nosotros.webp';
import FadeInOnScroll from './FadeInOnScroll';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  return (
    <FadeInOnScroll>
      <div className="info-section">
        <div className="info-image">
          <picture>
            <source srcSet={aboutImageWebp} type="image/webp" />
            <source srcSet={aboutImage} type="image/png" />
            <img src={aboutImage} alt={t('about_us_title')} loading="lazy" />
          </picture>
        </div>
        <div className="info-text">
          <h2>{t('about_us_title')}</h2>
          <p>
            {t('about_us_text')}
          </p>
        </div>
      </div>
    </FadeInOnScroll>
  );
}

export default About;
