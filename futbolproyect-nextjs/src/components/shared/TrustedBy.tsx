'use client';

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/TrustedBy.css"; // Path to the copied CSS
import { useTranslation } from 'react-i18next';
import Image from "next/image"; // Import next/image

// Hook para detectar si es móvil con breakpoint correcto
const useIsMobile = () => {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // Mobile: < 768px, Tablet/Desktop: >= 768px
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

function TrustedBy() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const logos = [
    {
      name: "Club A",
      url: "/images/logos/logofpazul.webp",
    },
    {
      name: "Agencia B",
      url: "/images/logos/logofpazul.webp",
    },
    {
      name: "Club C",
      url: "/images/logos/logofpazul.webp",
    },
    {
      name: "Club D",
      url: "/images/logos/logofpazul.webp",
    },
    {
      name: "Agencia E",
      url: "/images/logos/logofpazul.webp",
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: isMobile ? 3 : 5,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
  };

  return (
    <div className="trusted-by-container">
      <h4>{t('trusted_by')}</h4>
      <Slider {...settings}>
        {logos.map((logo, index) => (
          <div key={index} className="logo-item">
            <Image
              src={logo.url}
              alt={logo.name}
              width={120} // Fixed width from previous analysis
              height={120} // Fixed height from previous analysis
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default TrustedBy;
