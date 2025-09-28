import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import Slider from "react-slick";
import FadeInOnScroll from "./FadeInOnScroll";
import OfferActions from "./OfferActions";
import useIsMobile from "../hooks/useIsMobile";
import OptimizedImage from "./OptimizedImage";
import "./OfferList.css";

function OfferList({
  offers = [],
  onOfferAction,
  isHomePage = false,
  showApplyButton = true,
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [offersToDisplay, setOffersToDisplay] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    setOffersToDisplay(offers);
  }, [offers]);

  const handleViewOffer = (id) => {
    navigate(`/offers/${id}`);
  };

  const renderOfferCard = (offer) => {
    const lang = i18n.language;
    const titulo = offer[`titulo_${lang}`] || offer.titulo;
    const descripcion = offer[`descripcion_${lang}`] || offer.descripcion;
    const ubicacion = offer[`ubicacion_${lang}`] || offer.ubicacion;
    const puesto = offer[`puesto_${lang}`] || offer.puesto;

    const isMobileHome = isHomePage && isMobile;

    return (
      <Card
        key={offer.id}
        sx={{
          width: "100%",
          position: "relative",
          bgcolor: !isHomePage ? "primary.main" : "background.paper",
          color: !isHomePage ? "#fff" : "inherit",
          display: "flex",
          flexDirection: isHomePage || isMobileHome ? "column" : "row",
          height: "100%",
        }}
        elevation={2}
        className={`offer-card ${isHomePage ? "home-offer-card" : "offer-card-all-offers"}`}
        onClick={isHomePage ? () => handleViewOffer(offer.id) : undefined}
      >
        <div
          style={{
            width: isMobileHome ? "100%" : (isHomePage ? "100%" : "200px"),
            height: isHomePage || isMobileHome ? "150px" : "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: isMobileHome ? 0 : (isHomePage ? 16 : 0),
            background: "#e0e0e0",
            padding: '1rem',
            boxSizing: 'border-box'
          }}
        >
          {offer.imagen_url ? (
            <OptimizedImage
              src={offer.imagen_url}
              alt={titulo}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", 
              }}
            />
          ) : (
            <span style={{ color: "#888", fontSize: 16 }}>{t("no_image")}</span>
          )}
        </div>
        
        <CardContent sx={{ flexGrow: 1, p: isMobileHome ? 1 : 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Typography variant={isMobileHome ? "body1" : "h6"} sx={{ color: !isHomePage ? "#fff" : "inherit", fontWeight: isMobileHome ? 'bold' : 'regular' }}>
              {titulo}
            </Typography>

            <>
                <Typography variant="subtitle2" color={!isHomePage ? "#fff" : "text.secondary"}>
                  {t("published_by")} <strong>{offer.nombre_ofertante}</strong>
                </Typography>
                <Typography variant="body2" color={!isHomePage ? "#fff" : "text.secondary"}>
                  {t("location")} {ubicacion || t("not_specified")}
                </Typography>
                <Typography variant="body2" color={!isHomePage ? "#fff" : "text.secondary"}>
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
              </>
          </div>

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
                // Detener la propagación para evitar que el onClick de la Card se dispare también.
                e.stopPropagation();
                // Navegar siempre al detalle de la oferta.
                handleViewOffer(offer.id);
              }}
            >
              {t("view_offer")}
            </Button>
            {showApplyButton && (
              <OfferActions offer={offer} onOfferAction={onOfferAction} />
            )}
          </CardActions>
        </CardContent>
      </Card>
    );
  };

  const featuredOffers = offersToDisplay.filter((o) => o.is_featured);
  const normalOffers = offersToDisplay.filter((o) => !o.is_featured);

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1200,
    autoplaySpeed: 3500,
    cssEase: "linear",
    arrows: true,
    draggable: true,
    swipe: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <FadeInOnScroll>
      <div className="offer-list-container">
        {isHomePage && featuredOffers.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t("featured_offers")}
            </Typography>
            <Slider {...sliderSettings} className="offers-carousel">
              {featuredOffers.map((offer) => (
                <div key={offer.id} style={{ padding: 8 }}>
                  {renderOfferCard(offer)}
                </div>
              ))}
            </Slider>
            <hr />
          </>
        )}

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          {t("available_offers")}
        </Typography>

        {normalOffers.length === 0 ? (
          <Typography sx={{ mt: 2 }}>{t("no_offers_available")}</Typography>
        ) : isHomePage ? (
          <Slider
            {...sliderSettings}
            infinite={normalOffers.length > 3}
            className="offers-carousel"
          >
            {normalOffers.map((offer) => (
              <div key={offer.id} style={{ padding: 8 }}>
                {renderOfferCard(offer)}
              </div>
            ))}
          </Slider>
        ) : (
          <Stack direction="column" spacing={2} className="offers-list">
            {normalOffers.map((offer) => renderOfferCard(offer))}
          </Stack>
        )}
      </div>
    </FadeInOnScroll>
  );
}

export default OfferList;
