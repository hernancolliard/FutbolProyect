'use client';

import React from 'react';
import Link from 'next/link'; // Use next/link
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';
import useIsMobile from '../../hooks/useIsMobile'; // Migrated useIsMobile
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from "next/image"; // Use next/image
import '../../styles/FeaturedProfilesCarousel.css'; // Path to the copied CSS

// --- Mock LoadingSpinner for now ---
const LoadingSpinner = ({ text }: { text?: string }) => <div>{text || 'Loading...'}</div>;


// --- Custom Arrow Components ---
function NextArrow(props: any) { // Use any for props for now
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow next-arrow`}
      onClick={onClick}
    >
      <FaChevronRight />
    </div>
  );
}

function PrevArrow(props: any) { // Use any for props for now
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow prev-arrow`}
      onClick={onClick}
    >
      <FaChevronLeft />
    </div>
  );
}

import { Profile } from '../../lib/types';

interface FeaturedProfilesCarouselProps {
    profiles: Profile[];
}


function FeaturedProfilesCarousel({ profiles }: FeaturedProfilesCarouselProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const settings = {
    dots: true,
    infinite: profiles && profiles.length > (isMobile ? 2 : 4),
    speed: 500,
    slidesToShow: isMobile ? 2 : 4,
    slidesToScroll: isMobile ? 2 : 4,
    initialSlide: 0,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  if (!profiles || profiles.length === 0) {
    return null; // No renderizar nada si no hay perfiles
  }

  return (
    <div className="featured-profiles-carousel-container">
      <h2 className="carousel-title">{t('all_profiles_title')}</h2>
      <Slider {...settings} className="profiles-carousel">
        {profiles.map((profile) => (
          <div key={profile.id} className="carousel-profile-card-wrapper" style={{ padding: 2 }}>
            <div className="carousel-profile-card">
              <Link href={`/profile/${profile.id}`} className="carousel-profile-card-link">
                <Image
                  src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                  alt={`Perfil de ${profile.nombre} ${profile.apellido || ''}`}
                  className="carousel-profile-image"
                  width={180}
                  height={180}
                />
                <div className="carousel-profile-info">
                  <h3 className="carousel-profile-name">{`${profile.nombre} ${profile.apellido || ''}`}</h3>
                  <p className="carousel-profile-detail">{profile.posicion_principal || t('not_specified', 'No especificada')}</p>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default FeaturedProfilesCarousel;
