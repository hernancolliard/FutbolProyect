"use client";
import React from 'react';
import Image from 'next/image';
import { useTranslation } from "react-i18next";

const Mission = () => {
  const { t } = useTranslation();

  const missionImageWebp = '/images/mision.webp';

  return (
      <div className="info-section reverse">
        <div className="info-image">
          <Image
            src={missionImageWebp}
            alt={t('mission_title')}
            width={500}
            height={300}
          />
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