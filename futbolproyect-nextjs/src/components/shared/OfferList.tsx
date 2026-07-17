"use client";

import "@/styles/OfferList.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Slider from "react-slick";
import FadeInOnScroll from "./FadeInOnScroll";
import OfferActions from "./OfferActions";
import useIsMobile from "@/hooks/useIsMobile";
import AdBanner from "@/components/ads/AdBanner";
import { Offer } from "@/lib/types";
import { getOfferPath } from "@/lib/seoSlugs";

interface OfferListProps {
  offers?: Offer[];
  onOfferAction?: (action: string, id: string) => void;
  isHomePage?: boolean;
  showApplyButton?: boolean;
}

type OfferCardProps = {
  offer: Offer;
  showApplyButton: boolean;
  onOfferAction?: (action: string, id: string) => void;
  t: any;
  i18n: any;
  handleViewOffer: (offer: Offer) => void;
};

function OfferCard({
  offer,
  showApplyButton,
  onOfferAction,
  t,
  i18n,
  handleViewOffer,
}: OfferCardProps) {
  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const titulo = offer[`titulo_${lang}`] || offer.titulo;
  const descripcion = offer[`descripcion_${lang}`] || offer.descripcion;
  const ubicacion = offer[`ubicacion_${lang}`] || offer.ubicacion;
  const puesto = offer[`puesto_${lang}`] || offer.puesto;
  const nivel = offer[`nivel_${lang}`] || offer.nivel;
  const formattedDate = offer.fecha_publicacion
    ? new Intl.DateTimeFormat(lang === "es" ? "es-AR" : "en-US", {
        day: "2-digit",
        month: "short",
      }).format(new Date(offer.fecha_publicacion))
    : null;

  return (
    <Card
      elevation={0}
      onClick={() => handleViewOffer(offer)}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 345,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: offer.is_featured ? "rgba(18, 98, 219, .5)" : "#dfe6ef",
        borderRadius: 2.5,
        boxShadow: "0 5px 18px rgba(8, 34, 70, .045)",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 16px 35px rgba(8, 34, 70, .11)",
          borderColor: "#8fb8f3",
        },
      }}
    >
      {offer.is_featured && (
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #1262db, #47a1ff)",
          }}
        />
      )}
      <CardContent sx={{ p: 2.25, pb: 1.5, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
              {formattedDate && (
                <Chip
                  size="small"
                  label={formattedDate}
                  sx={{ bgcolor: "#edf5ff", color: "#1557ad", fontWeight: 700 }}
                />
              )}
              {nivel && (
                <Chip
                  size="small"
                  label={nivel}
                  sx={{ bgcolor: "#edf5ff", color: "#1557ad", fontWeight: 700 }}
                />
              )}
              {offer.is_featured && (
                <Chip size="small" label={t("featured")} color="primary" />
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              width: 70,
              height: 70,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "#f5f7fa",
              border: "1px solid #edf0f4",
              overflow: "hidden",
            }}
          >
            {offer.imagen_url ? (
              <Image
                src={offer.imagen_url}
                alt={titulo}
                width={70}
                height={70}
                sizes="70px"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 4,
                }}
              />
            ) : (
              <Image
                src="/images/logos/logofpazul.webp"
                alt="FutbolProyect"
                width={48}
                height={48}
                style={{ width: 44, height: 44, objectFit: "contain", opacity: 0.25 }}
              />
            )}
          </Box>
        </Stack>

        <Typography
          component="h2"
          sx={{
            mt: 1.5,
            color: "#09172d",
            fontSize: "1.05rem",
            lineHeight: 1.28,
            fontWeight: 900,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {titulo}
        </Typography>

        <Typography variant="caption" sx={{ color: "#65738a", display: "block", mt: 0.7 }}>
          {t("published_by", "Publicado por")}{" "}
          <Box component="span" sx={{ color: "#31517c", fontWeight: 700 }}>
            {offer.nombre_ofertante || "FutbolProyect"}
          </Box>
        </Typography>

        <Stack spacing={0.65} sx={{ mt: 1.4 }}>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: 17, color: "#3269b3" }} />
            <Typography variant="body2" sx={{ color: "#56657b" }} noWrap>
              {ubicacion || t("not_specified", "No especificado")}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.8} alignItems="center">
            <BadgeOutlinedIcon sx={{ fontSize: 17, color: "#3269b3" }} />
            <Typography variant="body2" sx={{ color: "#56657b" }} noWrap>
              {puesto || t("not_specified", "No especificado")}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            mt: 1.4,
            color: "#354258",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {descripcion || t("not_specified", "Sin descripción disponible")}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          px: 2.25,
          pb: 2.1,
          pt: 0.5,
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={(event) => {
            event.stopPropagation();
            handleViewOffer(offer);
          }}
          sx={{
            borderColor: "#1262db",
            color: "#1262db",
            fontWeight: 900,
            "&:hover": { bgcolor: "#edf5ff", borderColor: "#0d4faf" },
          }}
        >
          {t("view_offer", "Ver oferta")}
        </Button>

        {showApplyButton && (
          <OfferActions
            onOfferAction={onOfferAction}
            offer={{ ...offer, applicants: offer.applicants ?? [] }}
          />
        )}
      </CardActions>
    </Card>
  );
}

export default function OfferList({
  offers = [],
  onOfferAction,
  isHomePage = false,
  showApplyButton = true,
}: OfferListProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [offersToDisplay, setOffersToDisplay] = useState<Offer[]>(offers);
  const isMobile = useIsMobile();

  useEffect(() => setOffersToDisplay(offers), [offers]);

  const handleViewOffer = (offer: Offer) => router.push(getOfferPath(offer));
  const featuredOffers = offersToDisplay.filter((offer) => offer.is_featured);
  const normalOffers = offersToDisplay.filter((offer) => !offer.is_featured);
  const slides = Math.min(isMobile ? 1 : 4, offersToDisplay.length);
  const settings = {
    dots: true,
    infinite: offersToDisplay.length > slides,
    speed: 500,
    slidesToShow: slides,
    slidesToScroll: slides,
  };
  const cardProps = {
    showApplyButton,
    onOfferAction,
    t,
    i18n,
    handleViewOffer,
  };

  return (
    <FadeInOnScroll>
      <Box className="offer-list-container">
        {isHomePage && featuredOffers.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 900 }}>
              {t("featured_offers", "Ofertas destacadas")}
            </Typography>
            <Slider {...settings}>
              {featuredOffers.map((offer) => (
                <Box key={offer.id} sx={{ px: 1, height: "100%" }}>
                  <OfferCard {...cardProps} offer={offer} showApplyButton={false} />
                </Box>
              ))}
            </Slider>
          </>
        )}

        {isHomePage && normalOffers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 900 }}>
              {t("available_offers", "Ofertas disponibles")}
            </Typography>
            <Slider {...settings}>
              {normalOffers.map((offer) => (
                <Box key={offer.id} sx={{ px: 1, height: "100%" }}>
                  <OfferCard {...cardProps} offer={offer} showApplyButton={false} />
                </Box>
              ))}
            </Slider>
          </Box>
        )}

        {!isHomePage && (
          <Box className="offers-list">
            {offersToDisplay.map((offer, index) => (
              <React.Fragment key={offer.id}>
                <OfferCard {...cardProps} offer={offer} />
                {(index + 1) % 5 === 0 && (
                  <Box sx={{ gridColumn: "1 / -1", width: "100%" }}>
                    <AdBanner placement="offers_inline" compact />
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>
    </FadeInOnScroll>
  );
}
