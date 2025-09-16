import React from "react";
import missionImage from "../images/mision.png";
import missionImageWebp from "../images/mision.webp";
import { useTranslation } from 'react-i18next';

function Mission() {
  const { t } = useTranslation();

  return (
    <div className="info-section info-section-reverse">
      <div className="info-image">
        <picture>
          <source srcSet={missionImageWebp} type="image/webp" />
          <source srcSet={missionImage} type="image/png" />
          <img
            src={missionImage}
            alt={t('mission_title')}
            loading="lazy"
          />
        </picture>
      </div>
      <div className="info-text">
        <h2>{t('mission_title')}</h2>
        <p>
          {t('mission_text')}
        </p>
      </div>
    </div>
  );
}

export default Mission;
