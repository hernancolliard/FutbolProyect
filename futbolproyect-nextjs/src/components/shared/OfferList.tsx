"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import Slider from "react-slick";
import FadeInOnScroll from "./FadeInOnScroll";
import OfferActions from "./OfferActions";
import useIsMobile from "../../hooks/useIsMobile";
import Image from "next/image";

/* ============================
   TYPES
============================ */

interface Offer {
  id: string;
  is_featured: boolean;
  imagen_url?: string;
  titulo_es?: string;
  titulo_en?: string;
  titulo: string;
  descripcion_es?: string;
  descripcion_en?: string;
  descripcion: string;
  ubicacion_es?: string;
  ubicacion_en?: string;
  ubicacion: string;
  puesto_es?: string;
  puesto_en?: string;
  puesto: string;
  nombre_ofertante: string;
  id_usuario_ofertante: string;
  applicants?: { user_id: string }[];
}

interface OfferListProps {
  offers?: Offer[];
  onOfferAction?: (action: string, id: string) => void;
  isHomePage?: boolean;
  showApplyButton?: boolean;
}

/* ============================
   OFFER CARD
============================ */

const OfferCard = ({
  offer,
  isHomePage,
  isMobile,
  showApplyButton,
  onOfferAction,
  t,
  i18n,
  handleViewOffer,
}: {
  offer: Offer;
  isHomePage: boolean;
  isMobile: boolean;
  showApplyButton: boolean;
  onOfferAction?: (action: string, id: string) => void;
  t: any;
  i18n: any;
  handleViewOffer: (id: string) => void;
}) => {
  const lang = i18n.language.startsWith("es") ? "es" : "en";

  const titulo = (offer as any)[`titulo_${lang}`] || offer.titulo;
  const descripcion =
    (offer as any)[`descripcion_${lang}`] || offer.descripcion;
  const ubicacion = (offer as any)[`ubicacion_${lang}`] || offer.ubicacion;
  const puesto = (offer as any)[`puesto_${lang}`] || offer.puesto;

  const isMobileHome = isHomePage && isMobile;
  const imageWidth = isHomePage || isMobileHome ? 267 : 200;
  const imageHeight = isHomePage || isMobileHome ? 150 : 113;

  return (
    <Card
      sx={{
        width: "100%",
        position: "relative",
        bgcolor: !isHomePage ? "primary.main" : "background.paper",
        color: !isHomePage ? "#fff" : "inherit",
        display: "flex",
        flexDirection: isHomePage || isMobileHome ? "column" : "row",
        height: "100%",
        minHeight: isHomePage ? "420px" : "200px",
      }}
      elevation={2}
      onClick={isHomePage ? () => handleViewOffer(offer.id) : undefined}
    >
      <Box
        sx={{
          width: isMobileHome || isHomePage ? "100%" : "200px",
          height: isHomePage || isMobileHome ? "150px" : "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "#e0e0e0",
          p: 1,
        }}
      >
        {offer.imagen_url ? (
          <Image
            src={offer.imagen_url}
            alt={titulo}
            width={imageWidth}
            height={imageHeight}
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Typography color="text.secondary">{t("no_image")}</Typography>
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          p: isMobileHome ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant={isMobileHome ? "body1" : "h6"}
            sx={{
              color: !isHomePage ? "#fff" : "inherit",
              fontWeight: isMobileHome ? 700 : 400,
            }}
          >
            {titulo}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">
            {t("published_by")} <strong>{offer.nombre_ofertante}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t("location")} {ubicacion || t("not_specified")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t("position")} {puesto || t("not_specified")}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {descripcion}
          </Typography>
        </Box>

        <CardActions sx={{ p: 0, mt: 2 }}>
          <Button
            variant="contained"
            color={isHomePage ? "primary" : "secondary"}
            onClick={(e) => {
              e.stopPropagation();
              handleViewOffer(offer.id);
            }}
          >
            {t("view_offer")}
          </Button>

          {showApplyButton && (
            <OfferActions
              onOfferAction={onOfferAction}
              offer={{ ...offer, applicants: offer.applicants ?? [] }}
            />
          )}
        </CardActions>
      </CardContent>
    </Card>
  );
};

/* ============================
   OFFER LIST
============================ */

const OfferList = ({
  offers = [],
  onOfferAction,
  isHomePage = false,
  showApplyButton = true,
}: OfferListProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [offersToDisplay, setOffersToDisplay] = useState<Offer[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setOffersToDisplay(offers);
  }, [offers]);

  const handleViewOffer = (id: string) => {
    router.push(`/offers/${id}`);
  };

  const featuredOffers = offersToDisplay.filter((o) => o.is_featured);
  const normalOffers = offersToDisplay.filter((o) => !o.is_featured);

  const slides = Math.min(isMobile ? 2 : 4, offersToDisplay.length);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slides,
    slidesToScroll: slides,
  };

  return (
    <FadeInOnScroll>
      <div className="offer-list-container">
        {isHomePage && featuredOffers.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("featured_offers")}
            </Typography>
            <Slider {...settings}>
              {featuredOffers.map((offer) => (
                <div key={offer.id}>
                  <OfferCard
                    offer={offer}
                    isHomePage={isHomePage}
                    isMobile={isMobile}
                    showApplyButton={showApplyButton}
                    onOfferAction={onOfferAction}
                    t={t}
                    i18n={i18n}
                    handleViewOffer={handleViewOffer}
                  />
                </div>
              ))}
            </Slider>
          </>
        )}

        {!isHomePage && (
          <div className="offers-list">
            {normalOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isHomePage={false}
                isMobile={isMobile}
                showApplyButton={showApplyButton}
                onOfferAction={onOfferAction}
                t={t}
                i18n={i18n}
                handleViewOffer={handleViewOffer}
              />
            ))}
          </div>
        )}
      </div>
    </FadeInOnScroll>
  );
};

export default OfferList;
