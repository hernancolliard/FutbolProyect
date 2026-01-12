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
import ContactSummary from "@/components/ContactSummary"; // Migrated component
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

export default function HomePage() {
  const { t } = useTranslation('common');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState('player');
  const router = useRouter();

  const handleShowRegisterModal = (role) => {
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
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['homePageOffers'], 
    queryFn: fetchHomePageOffers 
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
          {isLoading ? (
            <LoadingSpinner text={t('loading_offers', 'Cargando ofertas...')} />
          ) : error ? (
            <Typography color="error" sx={{ mt: 2 }}>{t('error_loading_offers', 'Error al cargar ofertas.')}: {error.message}</Typography>
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

          <FeaturedProfilesCarousel />
          <Box sx={{ textAlign: 'center', padding: '2rem 0' }}>
            <Button component={Link} href="/featured-profiles" variant="contained" className="btn-main">
              {t("view_all_profiles", "Ver todos los perfiles")}
            </Button>
          </Box>

          <hr />
          <Box sx={{ mt: 4, mb: 4 }}>
            <About />
            <FadeInOnScroll>
              <Mission />
            </FadeInOnScroll>
          </Box>
          <hr />
          <FadeInOnScroll>
            <ContactSummary />
          </FadeInOnScroll>
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
        />
      </Modal>
    </Box>
  );
}