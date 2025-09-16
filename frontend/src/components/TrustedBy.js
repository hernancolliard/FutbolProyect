import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TrustedBy.css";
import { useTranslation } from 'react-i18next';
import OptimizedImage from './OptimizedImage';

function TrustedBy() {
  const { t } = useTranslation();
  const logos = [
    {
      name: "Club A",
      url: "/images/logos/club_a.jpeg",
    },
    {
      name: "Agencia B",
      url: "/images/logos/agency_b.png",
    },
    {
      name: "Club C",
      url: "/images/logos/club_c.png",
    },
    {
      name: "Club D",
      url: "/images/logos/club_d.png",
    },
    {
      name: "Agencia E",
      url: "/images/logos/agency_e.png",
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <div className="trusted-by-container">
      <h4>{t('trusted_by')}</h4>
      <Slider {...settings}>
        {logos.map((logo, index) => (
          <div key={index} className="logo-item">
            <OptimizedImage src={logo.url} alt={logo.name} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default TrustedBy;
