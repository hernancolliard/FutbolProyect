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

    return (
      <Card
        key={offer.id}
        sx={{
          width: "100%", // Ensure card takes full width of its container
          position: "relative",
          bgcolor: !isHomePage ? "primary.main" : "background.paper",
          color: !isHomePage ? "#fff" : "inherit",
          display: "flex",
          flexDirection: isHomePage ? "column" : "row", // Conditional flexDirection
          height: "100%", // Asegura que todas las cards tengan la misma altura
        }}
        elevation={2}
        className="offer-card offer-card-all-offers"
      >
        <div
          style={{
            width: isHomePage ? "100%" : "auto", // Changed width to auto for horizontal layout
            height: isHomePage ? "auto" : "100%", // Changed to auto for flexible height on homepage
            maxHeight: isHomePage ? 150 : "none", // Added maxHeight for homepage to control image size
            overflow: "hidden", // Ensure content doesn't overflow
            background: offer.imagen_url ? "none" : "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: isHomePage ? 0 : 16, // Add margin-right for horizontal layout
          }}
        >
          {offer.imagen_url ? (
            <img
              src={`http://localhost:5000/uploads/${offer.imagen_url}`}
              alt={titulo}
              className="offer-image"
              style={{
                width: "auto", // Changed width to auto
                height: "100%", // Keep height 100%
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ color: "#888", fontSize: 16 }}>{t("no_image")}</span>
          )}
        </div>
        {/* Conditional rendering for content and actions wrapper */}
        {isHomePage ? (
          <>
            {" "}
            {/* Old layout: CardContent and CardActions directly under Card */}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{ color: !isHomePage ? "#fff" : "inherit" }}
              >
                {titulo}
              </Typography>
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
                  WebkitLineClamp: 3, // Limitar a 3 líneas
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {descripcion}
              </Typography>
            </CardContent>
            <CardActions
              sx={{
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
                onClick={() => handleViewOffer(offer.id)}
              >
                {t("view_offer")}
              </Button>
              {showApplyButton && !isMobile && (
                <OfferActions offer={offer} onOfferAction={onOfferAction} />
              )}
            </CardActions>
          </>
        ) : (
          <Stack sx={{ flexGrow: 1, flexDirection: "column" }}>
            {" "}
            {/* New layout: Stack for content and actions */}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{ color: !isHomePage ? "#fff" : "inherit" }}
              >
                {titulo}
              </Typography>
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
                  WebkitLineClamp: 3, // Limitar a 3 líneas
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {descripcion}
              </Typography>
            </CardContent>
            <CardActions
              sx={{
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
                onClick={() => handleViewOffer(offer.id)}
              >
                {t("view_offer")}
              </Button>
              {showApplyButton && !isMobile && (
                <OfferActions offer={offer} onOfferAction={onOfferAction} />
              )}
            </CardActions>
          </Stack>
        )}
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
