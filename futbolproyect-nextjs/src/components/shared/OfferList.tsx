"use client";
import "@/styles/OfferList.css";
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
  Chip,
  Stack,
} from "@mui/material";
import Slider from "react-slick";
import FadeInOnScroll from "./FadeInOnScroll";
import OfferActions from "./OfferActions";
import useIsMobile from "@/hooks/useIsMobile";
import Image from "next/image";
import AdBanner from "@/components/ads/AdBanner";

import { Offer } from "@/lib/types";

/* ============================
   TYPES
============================ */

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
  const nivel = (offer as any)[`nivel_${lang}`] || (offer as any).nivel;
  const salario = (offer as any).salario;
  const fechaPublicacion = (offer as any).fecha_publicacion;
  const formattedDate = fechaPublicacion
    ? new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "short",
      }).format(new Date(fechaPublicacion))
    : null;

  // Los estilos unificados ahora siempre reflejan el diseño que se usaba para isHomePage
  const imageWidth = 267; // Siempre usar el ancho de imagen de la homepage
  const imageHeight = 150; // Siempre usar el alto de imagen de la homepage

  return (
    <Card
      sx={{
        width: "100%",
        position: "relative",
        bgcolor: "background.paper", // Fondo blanco para todas las tarjetas
        color: "inherit",
        display: "flex",
        flexDirection: "column", // Siempre en columna para diseño unificado
        height: "100%",
        minHeight: "420px", // Altura mínima unificada
        cursor: "pointer",
        border: offer.is_featured
          ? "1px solid rgba(245, 166, 35, 0.65)"
          : "1px solid rgba(25, 38, 52, 0.08)",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 14px 32px rgba(17, 24, 39, 0.12)",
          borderColor: "rgba(25, 38, 52, 0.2)",
        },
      }}
      elevation={2}
      onClick={() => handleViewOffer(offer.id)} // Siempre clickeable
    >
      <Box
        sx={{
          width: "100%",
          height: "150px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "#e0e0e0", // Fondo gris claro para el contenedor de la imagen
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
        {offer.is_featured && (
          <Chip
            label={t("featured", "Destacada")}
            color="secondary"
            size="small"
            sx={{ position: "absolute", top: 12, left: 12, fontWeight: 700 }}
          />
        )}
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}
          >
            {formattedDate && (
              <Chip size="small" label={formattedDate} variant="outlined" />
            )}
            {nivel && <Chip size="small" label={nivel} variant="outlined" />}
            {salario && (
              <Chip
                size="small"
                label={`${t("salary", "Salario:")} ${salario}`}
                variant="outlined"
              />
            )}
          </Stack>
          <Typography
            variant="h6"
            sx={{
              color: "inherit", // Color de texto normal
              fontWeight: 700,
              lineHeight: 1.25,
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

        <CardActions sx={{ p: 0, mt: 2, justifyContent: "space-between", gap: 1 }}>
          <Button
            variant="contained"
            color="primary" // Usar color primario para todos los botones de ver oferta
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
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
              {t("featured_offers")}
            </Typography>
                      <Slider {...settings}>
                        {featuredOffers.map((offer) => (
                          <div key={offer.id}>
                            <OfferCard
                              offer={offer}
                              isHomePage={isHomePage}
                              isMobile={isMobile}
                              showApplyButton={false} // Override to false for homepage
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
            
                    {/* Nueva sección para ofertas normales en la página de inicio */}
                    {isHomePage && normalOffers.length > 0 && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                          {t("available_offers", "Ofertas Disponibles")}
                        </Typography>
                        <Slider {...settings}>
                          {normalOffers.map((offer) => (
                            <div key={offer.id}>
                              <OfferCard
                                offer={offer}
                                isHomePage={isHomePage} // Mantener como isHomePage true para este render
                                isMobile={isMobile}
                                showApplyButton={false} // Override to false for homepage
                                onOfferAction={onOfferAction}
                                t={t}
                                i18n={i18n}
                                handleViewOffer={handleViewOffer}
                              />
                            </div>
                          ))}
                        </Slider>
                      </Box>
                    )}
        {!isHomePage && (
          <div className="offers-list">
            {offersToDisplay.map((offer, index) => (
              <React.Fragment key={offer.id}>
                <OfferCard
                  offer={offer}
                  isHomePage={false}
                  isMobile={isMobile}
                  showApplyButton={showApplyButton}
                  onOfferAction={onOfferAction}
                  t={t}
                  i18n={i18n}
                  handleViewOffer={handleViewOffer}
                />
                {(index + 1) % 5 === 0 && (
                  <div style={{ gridColumn: "1 / -1", width: "100%" }}>
                    <AdBanner placement="offers_inline" compact />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </FadeInOnScroll>
  );
};

export default OfferList;
