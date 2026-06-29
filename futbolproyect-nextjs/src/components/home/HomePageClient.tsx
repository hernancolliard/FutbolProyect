"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import apiClient from "@/lib/apiClient";
import Hero, { HomeMetric } from "@/components/Hero";
import HomeRoleGrid from "@/components/home/HomeRoleGrid";
import {
  HomeOffersShowcase,
  HomeProfilesShowcase,
} from "@/components/home/HomeShowcases";
import HomeAudienceSpotlight from "@/components/home/HomeAudienceSpotlight";
import HomeFinalCta from "@/components/home/HomeFinalCta";
import HomeSeoOverview from "@/components/home/HomeSeoOverview";
import HowItWorks from "@/components/shared/HowItWorks";
import HomeTrustSignals from "@/components/shared/HomeTrustSignals";
import HomeFAQ from "@/components/shared/HomeFAQ";
import ContactPageClient from "@/components/client-components/ContactPageClient";
import PromotionModal from "@/components/PromotionModal";
import Modal from "@/components/ui/Modal";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import AdBanner from "@/components/ads/AdBanner";
import { Offer, Profile } from "@/lib/types";

type HomeOffersData = {
  offers: Offer[];
  totalOffers: number;
};

const fetchHomePageOffers = async (): Promise<HomeOffersData> => {
  try {
    const { data } = await apiClient.get("/offers?limit=6&show=all");
    return {
      offers: Array.isArray(data?.offers) ? data.offers : [],
      totalOffers: Number(data?.totalOffers || 0),
    };
  } catch (error) {
    console.error("Error fetching home page offers:", error);
    return { offers: [], totalOffers: 0 };
  }
};

const fetchFeaturedProfiles = async (): Promise<Profile[]> => {
  try {
    const { data } = await apiClient.get("/profiles/featured");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching featured profiles:", error);
    return [];
  }
};

export default function HomePageClient() {
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

  const { data: offersData = { offers: [], totalOffers: 0 } } =
    useQuery<HomeOffersData>({
      queryKey: ["homePageOffers"],
      queryFn: fetchHomePageOffers,
    });

  const { data: featuredProfiles = [] } = useQuery<Profile[]>({
    queryKey: ["featuredProfiles"],
    queryFn: fetchFeaturedProfiles,
  });

  const metrics = useMemo<HomeMetric[]>(() => {
    const locations = new Set(
      offersData.offers.map((offer) => offer.ubicacion).filter(Boolean),
    ).size;
    const roles = new Set(
      offersData.offers.map((offer) => offer.puesto).filter(Boolean),
    ).size;
    return [
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
  }, [featuredProfiles.length, offersData]);

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
            <HomeSeoOverview />

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
