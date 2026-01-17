'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import { Box, Typography, Button, Toolbar } from "@mui/material";

import apiClient from "@/lib/apiClient"; // Centralized apiClient
import TrustedBy from "@/components/shared/TrustedBy"; // Migrated component
import Hero from "@/components/Hero"; // Migrated component
import OfferList from "@/components/shared/OfferList"; // Migrated component
import FeaturedProfilesCarousel from "@/components/shared/FeaturedProfilesCarousel"; // Migrated component
import About from "@/components/shared/About"; // Migrated component
import Mission from "@/components/shared/Mission"; // Migrated component
import ContactPageClient from "@/components/client-components/ContactPageClient"; // Importar el componente de contacto
import LoadingSpinner from "@/components/LoadingSpinner"; // Migrated component
import PromotionModal from "@/components/PromotionModal"; // Migrated component
import Modal from "@/components/ui/Modal"; // Migrated Modal (custom)
import Login from "@/components/auth/Login"; // Migrated Login
import Register from "@/components/auth/Register"; // Migrated Register
import FadeInOnScroll from "@/components/FadeInOnScroll"; // Migrated FadeInOnScroll

const fetchHomePageOffers = async () => {
  const { data } = await apiClient.get("/offers?limit=6");
  return [...(data.featuredOffers || []), ...(data.offers || [])];
};

const fetchFeaturedProfiles = async () => {
  const { data } = await apiClient.get("/profiles/featured");
  return data.profiles || [];
};

export default function HomePage() {
  const { t } = useTranslation(); // Usar el namespace por defecto 'translation'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<'player' | 'club'>('player');
  const router = useRouter();

  const handleShowRegisterModal = (role: 'player' | 'club') => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('promotionModalShown');
    const currentMonth = new Date().getMonth(); // 0-11 (enero-diciembre)

    if (!alreadyShown && currentMonth === 10) { // 10 es Noviembre
      setShowPromotionModal(true);
      sessionStorage.setItem('promotionModalShown', 'true');
    }
  }, []);

  const { 
    data: homePageOffers = [], 
    isLoading: isLoadingOffers, 
    error: errorOffers 
  } = useQuery({ 
    queryKey: ['homePageOffers'], 
    queryFn: fetchHomePageOffers 
  });

  const { 
    data: featuredProfiles = [], 
    isLoading: isLoadingProfiles, 
    error: errorProfiles 
  } = useQuery({ 
    queryKey: ['featuredProfiles'], 
    queryFn: fetchFeaturedProfiles 
  });

  const handleRefresh = () => {
    // Invalidate queries if needed, though onHomePage is not directly used here for refresh
  };

  return (
    <Box>
      {/* Header and Footer are handled by RootClientLayout */}
      <Box component="main">
        <FadeInOnScroll>
          <TrustedBy />
        </FadeInOnScroll>
        <Hero />
        <Box sx={{ p: 3 }}>
          {isLoadingOffers ? (
            <LoadingSpinner text={t('loading_offers', 'Cargando ofertas...')} />
          ) : errorOffers ? (
            <Typography color="error" sx={{ mt: 2 }}>{t('error_loading_offers', 'Error al cargar ofertas.')}: {errorOffers.message}</Typography>
          ) : (
            <OfferList
              offers={homePageOffers}
              onOfferAction={handleRefresh}
              isHomePage={true}
            />
          )}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button component={Link} href="/all-offers" variant="contained" className="btn-main">
              {t("view_all_offers", "Ver todas las ofertas")}
            </Button>
          </Box>

          {isLoadingProfiles ? (
            <LoadingSpinner text={t('loading_profiles', 'Cargando perfiles...')} />
          ) : errorProfiles ? (
            <Typography color="error" sx={{ mt: 2 }}>{t('error_loading_profiles', 'Error al cargar perfiles.')}: {errorProfiles.message}</Typography>
          ) : (
            <FeaturedProfilesCarousel profiles={featuredProfiles} />
          )}
          <Box sx={{ textAlign: 'center', padding: '2rem 0' }}>
            <Button component={Link} href="/featured-profiles" variant="contained" className="btn-main">
              {t("view_all_profiles", "Ver todos los perfiles")}
            </Button>
          </Box>

          <hr />
          <Box
            id="contact-section"
            sx={{
              backgroundColor: 'primary.main',
              py: 8,
              px: 2,
              mt: 4,
              mb: 4,
            }}
          >
            <ContactPageClient />
          </Box>
        </Box>
      </Box>

      <PromotionModal 
        isOpen={showPromotionModal} 
        onClose={() => setShowPromotionModal(false)} 
        onShowRegisterModal={handleShowRegisterModal} 
      />

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <Login onClose={() => setShowLoginModal(false)} />
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <Register
          onClose={() => setShowRegisterModal(false)}
          initialRole={registrationRole}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </Modal>
    </Box>
  );
}