import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

function MyOffersList({ offers, isOwnProfile, isAdmin }) {
  const { t } = useTranslation();

  return (
    <Stack className="my-lists-section" spacing={2} sx={{ mt: 2 }}>
      <Typography variant="h6">{t("my_published_offers")}</Typography>
      <Stack className="offers-list-container" spacing={2}>
        {offers.length > 0 ? (
          offers.map((offer) => (
            <Card key={offer.id} className="offer-item">
              <CardContent>
                <Typography
                  variant="h6"
                  component={Link}
                  to={`/offers/${offer.id}`}
                  sx={{ textDecoration: "none" }}
                >
                  {offer.titulo}
                </Typography>
                <Typography>
                  <strong>{t("status")}</strong> {offer.estado}
                </Typography>
                <Typography>
                  <strong>{t("date")}</strong>{" "}
                  {new Date(offer.fecha_publicacion).toLocaleDateString()}
                </Typography>
                <Typography>
                  {offer.descripcion.substring(0, 100)}...
                </Typography>
                <Button
                  component={Link}
                  to={`/offers/${offer.id}/applicants`}
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  {t("view_applicants")}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>{t("no_offers_published_yet")}</Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default MyOffersList;
