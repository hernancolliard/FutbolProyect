"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import Hero, { HomeMetric } from "@/components/Hero";
import HomeRoleGrid from "@/components/home/HomeRoleGrid";
import {
  HomeOffersShowcase,
  HomeProfilesShowcase,
} from "@/components/home/HomeShowcases";
import HomeAudienceSpotlight from "@/components/home/HomeAudienceSpotlight";
import HomeFinalCta from "@/components/home/HomeFinalCta";
import HowItWorks from "@/components/shared/HowItWorks";
import HomeTrustSignals from "@/components/shared/HomeTrustSignals";
import HomeFAQ from "@/components/shared/HomeFAQ";
import ContactPageClient from "@/components/client-components/ContactPageClient";
import Modal from "@/components/ui/Modal";
import AdBanner from "@/components/ads/AdBanner";
import { Offer, Profile } from "@/lib/types";

const PromotionModal = dynamic(() => import("@/components/PromotionModal"), {
  ssr: false,
});
const Login = dynamic(() => import("@/components/auth/Login"), { ssr: false });
const Register = dynamic(() => import("@/components/auth/Register"), {
  ssr: false,
});

type HomeOffersData = {
  offers: Offer[];
  totalOffers: number;
};

type HomePageClientProps = {
  offersData: HomeOffersData;
  featuredProfiles: Profile[];
  seoOverview: React.ReactNode;
};

export default function HomePageClient({
  offersData,
  featuredProfiles,
  seoOverview,
}: HomePageClientProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<"player" | "club">(
    "player",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyShown = sessionStorage.getItem("promotionModalShown");
    const currentMonth = new Date().getMonth();
    if (!alreadyShown && currentMonth === 10) {
      setShowPromotionModal(true);
      sessionStorage.setItem("promotionModalShown", "true");
    }
  }, []);

  const locations = new Set(
    offersData.offers.map((offer) => offer.ubicacion).filter(Boolean),
  ).size;
  const roles = new Set(
    offersData.offers.map((offer) => offer.puesto).filter(Boolean),
  ).size;
  const metrics: HomeMetric[] = [
      {
        value: offersData.totalOffers || offersData.offers.length || "—",
        label: "Ofertas activas",
      },
      {
        value: featuredProfiles.length || "—",
        label: "Perfiles destacados",
      },
      { value: locations || "—", label: "Ubicaciones activas" },
      { value: roles || "—", label: "Roles publicados" },
  ];

  const handleShowRegisterModal = (role: "player" | "club") => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc" }}>
      <Box>
        <Hero metrics={metrics} />

        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 13, md: 11 },
            pb: { xs: 7, md: 9 },
          }}
        >
          <Stack spacing={{ xs: 5, md: 6 }}>
            {seoOverview}

            <HomeRoleGrid />

            <AdBanner placement="home_middle" />

            <HomeOffersShowcase offers={offersData.offers} />

            <HomeProfilesShowcase profiles={featuredProfiles} />

            <HowItWorks />

            <HomeTrustSignals />

            <HomeAudienceSpotlight />

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                border: "1px solid #dfe6ef",
                borderRadius: 2.5,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 2,
                    bgcolor: "#edf5ff",
                    color: "#1262db",
                    flexShrink: 0,
                  }}
                >
                  <CampaignOutlinedIcon />
                </Box>
                <Box>
                  <Typography sx={{ color: "#0a1930", fontWeight: 900 }}>
                    Anunciá con FutbolProyect
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.4, color: "#65738a" }}>
                    Llegá a una comunidad enfocada en talento y oportunidades deportivas.
                  </Typography>
                </Box>
              </Stack>
              <Button
                component={Link}
                href="/publicidad"
                variant="contained"
                sx={{ bgcolor: "#1262db", fontWeight: 900, whiteSpace: "nowrap" }}
              >
                Conocer opciones
              </Button>
            </Paper>

            <HomeFAQ />

            <AdBanner placement="home_profiles" />

            <ContactPageClient compact />

            <HomeFinalCta />
          </Stack>
        </Container>
      </Box>

      {showPromotionModal && (
        <PromotionModal
          isOpen
          onClose={() => setShowPromotionModal(false)}
          onShowRegisterModal={handleShowRegisterModal}
        />
      )}

      {showLoginModal && (
        <Modal isOpen onClose={() => setShowLoginModal(false)}>
          <Login onClose={() => setShowLoginModal(false)} />
        </Modal>
      )}

      {showRegisterModal && (
        <Modal isOpen onClose={() => setShowRegisterModal(false)}>
          <Register
            initialRole={registrationRole}
            onClose={() => setShowRegisterModal(false)}
            onSwitchToLogin={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
            }}
          />
        </Modal>
      )}
    </Box>
  );
}
