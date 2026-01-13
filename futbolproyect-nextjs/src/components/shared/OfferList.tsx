'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use useRouter from next/navigation
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
  Box
} from "@mui/material";
import Slider from "react-slick";
import FadeInOnScroll from "./FadeInOnScroll"; // Migrated FadeInOnScroll
import OfferActions from "./OfferActions"; // Now importing the real OfferActions
import useIsMobile from "../../hooks/useIsMobile"; // Migrated useIsMobile
import Image from "next/image"; // Use next/image



// Define types for Offer
interface Offer {
  id: string;
  is_featured: boolean;
  imagen_url?: string;
  titulo_es?: string;
  titulo_en?: string;
  titulo: string; // Fallback
  descripcion_es?: string;
  descripcion_en?: string;
  descripcion: string; // Fallback
  ubicacion_es?: string;
  ubicacion_en?: string;
  ubicacion: string; // Fallback
  puesto_es?: string;
  puesto_en?: string;
  puesto: string; // Fallback
  nombre_ofertante: string;
  id_usuario_ofertante: string; // Added for OfferActions
  applicants?: { user_id: string }[]; // Added for OfferActions
  // Add other offer properties as needed
}

interface OfferListProps {
    offers?: Offer[];
    onOfferAction?: (action: string, id: string) => void;
    isHomePage?: boolean;
    showApplyButton?: boolean;
}


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
  const lang = i18n.language;
  const titulo = (offer as any)[`titulo_${lang}`] || offer.titulo;
  const descripcion = (offer as any)[`descripcion_${lang}`] || offer.descripcion;
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
      className={`offer-card ${isHomePage ? "home-offer-card" : "offer-card-all-offers"}`}
      onClick={isHomePage ? () => handleViewOffer(offer.id) : undefined}
    >
      <Box
        sx={{ // Changed div to Box for Material UI consistency
          width: isMobileHome ? "100%" : isHomePage ? "100%" : "200px",
          height: isHomePage || isMobileHome ? "150px" : "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginRight: isMobileHome ? 0 : isHomePage ? 16 : 0,
          background: "#e0e0e0",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        {offer.imagen_url ? (
          <Image
            src={offer.imagen_url}
            alt={titulo}
            width={imageWidth}
            height={imageHeight}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Typography component="span" sx={{ color: "#888", fontSize: 16 }}>{t("no_image")}</Typography> // Changed span to Typography
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
        <Box> {/* Changed div to Box */}
          <Typography
            variant={isMobileHome ? "body1" : "h6"}
            sx={{
              color: !isHomePage ? "#fff" : "inherit",
              fontWeight: isMobileHome ? "bold" : "regular",
            }}
          >
            {titulo}
          </Typography>

          <React.Fragment> {/* Changed <> to React.Fragment */}
            <Typography
              variant="subtitle2"
              color={!isHomePage ? "#fff" : "text.secondary"}
            >
              {t("published_by")} <strong>{offer.nombre_ofertante}</strong>
            </Typography>
            <Typography
              variant="body2"
              color={!isHomePage ? "#fff" : "text.secondary"}
            >
              {t("location")} {ubicacion || t("not_specified")}
            </Typography>
            <Typography
              variant="body2"
              color={!isHomePage ? "#fff" : "text.secondary"}
            >
              {t("position")} {puesto || t("not_specified")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: !isHomePage ? "#fff" : "inherit",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {descripcion}
            </Typography>
          </React.Fragment>
        </Box>

        <CardActions
          sx={{
            p: 0,
            mt: isMobileHome ? 1 : 2,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            "& > :not(style)": {
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
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
            <OfferActions onOfferAction={onOfferAction} offer={offer} />
          )}
        </CardActions>
      </Card>
    );
};


const OfferList = ({
  offers = [],
  onOfferAction,
  isHomePage = false,
  showApplyButton = true,
}: OfferListProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [offersToDisplay, setOffersToDisplay] = useState<Offer[]>([]); // Use Offer type
  const isMobile = useIsMobile();

  useEffect(() => {
    setOffersToDisplay(offers);
  }, [offers]);

  const handleViewOffer = (id: string) => { // Use string type for id
    router.push(`/offers/${id}`);
  };



  const featuredOffers = offersToDisplay.filter((o) => o.is_featured);
  const normalOffers = offersToDisplay.filter((o) => !o.is_featured);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 2 : 4,
    slidesToScroll: isMobile ? 2 : 4,
    initialSlide: 0,
  };
  return (
    <FadeInOnScroll>
      <div className="offer-list-container">
        {isHomePage && featuredOffers.length > 0 && (
          <Box> {/* Changed <> to Box */}
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("featured_offers")}
            </Typography>
            <Slider {...settings} className="offers-carousel">
              {featuredOffers.map((offer) => (
                <div key={offer.id} style={{ padding: 2 }}>
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
            <hr />
          </Box>
        )}

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {t("available_offers")}
        </Typography>

        {normalOffers.length === 0 ? (
          <Typography sx={{ mt: 2 }}>{t("no_offers_available")}</Typography>
        ) : isHomePage ? (
          <Slider
            {...settings}
            infinite={normalOffers.length > 3}
            className="offers-carousel"
          >
            {normalOffers.map((offer) => (
              <div key={offer.id} style={{ padding: 2 }}>
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
        ) : (
          <div className="offers-list">
            {offersToDisplay.map((offer) => renderOfferCard(offer))}
          </div>
        )}
      </div>
    </FadeInOnScroll>
  );
}

export default OfferList;
