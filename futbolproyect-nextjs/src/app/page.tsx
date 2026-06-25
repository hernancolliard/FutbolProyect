"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
export const dynamic = 'force-dynamic';
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Box, Typography, Button } from "@mui/material";

import apiClient from "@/lib/apiClient";
import TrustedBy from "@/components/shared/TrustedBy";
import Hero from "@/components/Hero";
import OfferList from "@/components/shared/OfferList";
import FeaturedProfilesCarousel from "@/components/shared/FeaturedProfilesCarousel";
import About from "@/components/shared/About";
import Mission from "@/components/shared/Mission";
import HowItWorks from "@/components/shared/HowItWorks";
import HomeTrustSignals from "@/components/shared/HomeTrustSignals";
import HomeFAQ from "@/components/shared/HomeFAQ";
import ContactPageClient from "@/components/client-components/ContactPageClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import PromotionModal from "@/components/PromotionModal";
import Modal from "@/components/ui/Modal";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import FadeInOnScroll from "@/components/FadeInOnScroll";
import AdBanner from "@/components/ads/AdBanner";

/* =========================
   FETCHERS (CLIENT SAFE)
========================= */
const fetchHomePageOffers = async () => {
  try {
    const { data } = await apiClient.get("/offers?limit=6");
    return [...(data.featuredOffers || []), ...(data.offers || [])];
  } catch (error) {
    console.error("Error fetching home page offers:", error);
    return [];
  }
};

const fetchFeaturedProfiles = async () => {
  try {
    const { data } = await apiClient.get("/profiles/featured");
    return data || [];
  } catch (error) {
    console.error("Error fetching featured profiles:", error);
    return [];
  }
};

export default function HomePage() {
  const { t } = useTranslation();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<"player" | "club">(
    "player",
  );

  /* =========================
     PROMO MODAL (CLIENT ONLY)
  ========================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alreadyShown = sessionStorage.getItem("promotionModalShown");
    const currentMonth = new Date().getMonth(); // 0-11

    if (!alreadyShown && currentMonth === 10) {
      setShowPromotionModal(true);
      sessionStorage.setItem("promotionModalShown", "true");
    }
  }, []);

  /* =========================
     QUERIES
  ========================= */
  const {
    data: homePageOffers = [],
    isLoading: isLoadingOffers,
    error: errorOffers,
  } = useQuery({
    queryKey: ["homePageOffers"],
    queryFn: fetchHomePageOffers,
  });

  const {
    data: featuredProfiles = [],
    isLoading: isLoadingProfiles,
    error: errorProfiles,
  } = useQuery({
    queryKey: ["featuredProfiles"],
    queryFn: fetchFeaturedProfiles,
  });

  const handleShowRegisterModal = (role: "player" | "club") => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  return (
    <Box>
      <Box component="main">
        <Hero />

        <FadeInOnScroll>
          <TrustedBy />
        </FadeInOnScroll>

        <FadeInOnScroll>
          <HowItWorks />
        </FadeInOnScroll>

        {/* HomeTrustSignals moved to appear after offers and profiles for better flow */}

        <Box sx={{ p: 3 }}>
          <FadeInOnScroll>
            <Box
              component="section"
              sx={{
                maxWidth: 1180,
                mx: "auto",
                mb: 3,
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                bgcolor: "#f2f6fa",
                border: "1px solid rgba(25, 38, 52, 0.12)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
                    {t("advertising_home_title")}
                  </Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                    {t("advertising_home_description")}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/publicidad"
                  variant="contained"
                  color="secondary"
                  sx={{ alignSelf: { xs: "stretch", md: "center" }, whiteSpace: "nowrap" }}
                >
                  {t("advertising_home_cta")}
                </Button>
              </Box>
            </Box>
          </FadeInOnScroll>

          <AdBanner placement="home_middle" />

          {/* OFERTAS */}
          {isLoadingOffers ? (
            <LoadingSpinner text={t("loading_offers", "Cargando ofertas...")} />
          ) : errorOffers ? (
            <Typography color="error">
              {t("error_loading_offers", "Error al cargar ofertas")}
            </Typography>
          ) : (
            <FadeInOnScroll>
              <OfferList
                offers={homePageOffers}
                isHomePage
                onOfferAction={() => {}}
              />
            </FadeInOnScroll>
          )}

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              component={Link}
              href="/all-offers"
              variant="contained"
              className="btn-main"
            >
              {t("view_all_offers", "Ver todas las ofertas")}
            </Button>
          </Box>

          {/* PERFILES */}
          {isLoadingProfiles ? (
            <LoadingSpinner
              text={t("loading_profiles", "Cargando perfiles...")}
            />
          ) : errorProfiles ? (
            <Typography color="error">
              {t("error_loading_profiles", "Error al cargar perfiles")}
            </Typography>
          ) : (
            <FadeInOnScroll>
              <FeaturedProfilesCarousel profiles={featuredProfiles} />
            </FadeInOnScroll>
          )}

          <AdBanner placement="home_profiles" />

          <Box sx={{ textAlign: "center", py: 4 }}>
            <Button
              component={Link}
              href="/featured-profiles"
              variant="contained"
              className="btn-main"
            >
              {t("view_all_profiles")}
            </Button>
          </Box>

          <FadeInOnScroll>
            <HomeTrustSignals />
          </FadeInOnScroll>

          <hr />

          <FadeInOnScroll>
            <About />
          </FadeInOnScroll>

          <FadeInOnScroll>
            <Mission />
          </FadeInOnScroll>

          <FadeInOnScroll>
            <HomeFAQ />
          </FadeInOnScroll>

          <hr />

          <Box
            id="contact-section"
            sx={{
              backgroundColor: "primary.main",
              py: 8,
              px: 2,
              mt: 4,
            }}
          >
            <ContactPageClient />
          </Box>
        </Box>
      </Box>

      {/* MODALES */}
      <PromotionModal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        onShowRegisterModal={handleShowRegisterModal}
      />

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <Login onClose={() => setShowLoginModal(false)} />
      </Modal>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      >
        <Register
          initialRole={registrationRole}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </Modal>
    </Box>
  );
}
