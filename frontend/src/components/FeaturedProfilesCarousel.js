
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import useIsMobile from '../hooks/useIsMobile';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './FeaturedProfilesCarousel.css';

// --- Custom Arrow Components ---
function NextArrow(props) {
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

function PrevArrow(props) {
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


const fetchFeaturedProfiles = async () => {
  const { data } = await apiClient.get('/profiles/destacados');
  return data;
};

function FeaturedProfilesCarousel() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { data: profiles, isLoading, isError, error } = useQuery({
    queryKey: ['featuredProfiles'],
    queryFn: fetchFeaturedProfiles,
  });

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

  if (isLoading) {
    return <LoadingSpinner text={t('loading_profiles', 'Cargando perfiles...')} />;
  }

  if (isError) {
    return <div className="error-message">{t('error_loading_profiles', 'Hubo un error al cargar los perfiles:')} {error.message}</div>;
  }

  if (!profiles || profiles.length === 0) {
    return null; // No renderizar nada si no hay perfiles
  }

  return (
    <div className="featured-profiles-carousel-container">
      <h2 className="carousel-title">{t('featured_profiles_title', 'Perfiles Destacados')}</h2>
      <Slider {...settings} className="profiles-carousel">
        {profiles.map((profile) => (
          <div key={profile.id} className="carousel-profile-card-wrapper">
            <div className="carousel-profile-card">
              <Link to={`/profile/${profile.id}`} className="carousel-profile-card-link">
                <img
                  src={profile.foto_perfil_url || '/images/logos/logofp.png'}
                  alt={`Perfil de ${profile.nombre} ${profile.apellido || ''}`}
                  className="carousel-profile-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/logos/logofp.png'; }}
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
