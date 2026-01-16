"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { Offer } from "@/lib/types";

// CORRECCIÓN: Interfaz para evitar 'implicitly has an any type'
interface MyOffersListProps {
  offers: Offer[];
  isOwnProfile?: boolean;
  isAdmin?: boolean;
}

function MyOffersList({ offers, isOwnProfile, isAdmin }: MyOffersListProps) {
  const { t } = useTranslation("common");

  return (
    <Stack className="my-lists-section" spacing={2} sx={{ mt: 2 }}>
      <Typography variant="h6">
        {t("my_published_offers", "Mis Ofertas Publicadas")}
      </Typography>
      <Stack className="offers-list-container" spacing={2}>
        {offers && offers.length > 0 ? (
          offers.map((offer) => (
            <Card key={offer.id} className="offer-item">
              <CardContent>
                <Typography
                  variant="h6"
                  component={Link}
                  href={`/offers/${offer.id}`}
                  sx={{ textDecoration: "none" }}
                >
                  {offer.titulo}
                </Typography>
                <Typography>
                  <strong>{t("status", "Estado")}:</strong>{" "}
                  {(offer as any).estado || "Activa"}
                </Typography>
                <Typography>
                  <strong>{t("date", "Fecha")}:</strong>{" "}
                  {/* Verificamos que fecha_publicacion exista, si no usamos la actual o null */}
                  {(offer as any).fecha_publicacion
                    ? new Date(
                        (offer as any).fecha_publicacion,
                      ).toLocaleDateString()
                    : ""}
                </Typography>
                <Typography>
                  {offer.descripcion ? offer.descripcion.substring(0, 100) : ""}
                  ...
                </Typography>
                <Button
                  component={Link}
                  href={`/offers/${offer.id}/applicants`}
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  {t("view_applicants", "Ver Postulantes")}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>
            {t("no_offers_published_yet", "Aún no has publicado ofertas.")}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

export default MyOffersList;
