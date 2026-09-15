"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Container, Stack } from "@mui/material";
import Hero from "@/components/Hero";
import HomeRoleGrid from "@/components/home/HomeRoleGrid";
import {
  HomeOffersShowcase,
  HomeProfilesShowcase,
} from "@/components/home/HomeShowcases";
import HomeAudienceSpotlight from "@/components/home/HomeAudienceSpotlight";
import HomeFinalCta from "@/components/home/HomeFinalCta";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import HowItWorks from "@/components/shared/HowItWorks";
import HomeTrustSignals from "@/components/shared/HomeTrustSignals";
import HomeFAQ from "@/components/shared/HomeFAQ";
import ContactPageClient from "@/components/client-components/ContactPageClient";
import Modal from "@/components/ui/Modal";
import AdBanner from "@/components/ads/AdBanner";
import { FeaturedVideo, Offer, Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

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
  featuredVideos: FeaturedVideo[];
  seoOverview: React.ReactNode;
};

export default function HomePageClient({
  offersData,
  featuredProfiles,
  featuredVideos,
  seoOverview,
}: HomePageClientProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
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

  const handleShowRegisterModal = (role: "player" | "club") => {
    setRegistrationRole(role);
    setShowRegisterModal(true);
  };

  return (
    <Box sx={{ bgcolor: "#f7f9fc" }}>
      <Box>
        <Hero />

        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 6, md: 8 },
            pb: { xs: 7, md: 9 },
          }}
        >
          <Stack spacing={{ xs: 4.5, md: 6 }}>
            <HomeOffersShowcase offers={offersData.offers} />

            <HomeProfilesShowcase profiles={featuredProfiles} />

            <HowItWorks />

            <HomeRoleGrid />

            <FeaturedVideos videos={featuredVideos} />

            <HomeTrustSignals />

            <HomeAudienceSpotlight />

            {seoOverview}

            <AdBanner placement="home_middle" />

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
          <Login
            onClose={() => setShowLoginModal(false)}
            onGoogleRegistration={() => {
              setShowLoginModal(false);
              router.push("/profile");
            }}
          />
        </Modal>
      )}

      {showRegisterModal && (
        <Modal isOpen onClose={() => setShowRegisterModal(false)}>
          <Register
            initialRole={registrationRole}
            onClose={() => setShowRegisterModal(false)}
            onSuccess={() => {
              setShowRegisterModal(false);
              router.push("/profile");
            }}
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
