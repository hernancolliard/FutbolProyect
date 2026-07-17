"use client";

import { useTranslation } from "react-i18next";
import SeoPage from "@/components/shared/SeoPage";
import OfferList from "@/components/shared/OfferList";
import { Offer } from "@/lib/types";

type Props = {
  offers: Offer[];
  translationPrefix: string;
  ctaKey?: string;
};

export default function OfferSeoLandingContent({
  offers,
  translationPrefix,
  ctaKey = "home_create_profile_free",
}: Props) {
  const { t } = useTranslation("common");

  return (
    <SeoPage
      h1={t(`${translationPrefix}_h1`)}
      mainText={t(`${translationPrefix}_main_text`)}
      h2={t(`${translationPrefix}_h2`)}
      ctaText={t(ctaKey)}
      ctaLink="/register"
      internalLinks={[
        { href: "/all-offers", label: t("view_all_offers") },
        { href: "/perfiles/jugadores", label: t("seo_link_player_profiles") },
        { href: "/create-offer", label: t("publish_offer") },
      ]}
    >
      {offers.length > 0 ? (
        <OfferList offers={offers} isHomePage={false} showApplyButton={false} />
      ) : null}
    </SeoPage>
  );
}
