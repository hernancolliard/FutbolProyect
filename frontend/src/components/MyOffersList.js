import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

function MyOffersList({ userId, isOwnProfile, isAdmin }) {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get(`/profiles/${userId}/offers`);
        // --- LA LÍNEA CLAVE ---
        // Asegúrate de que response.data sea un array antes de guardarlo.
        // Si no lo es, guarda un array vacío para evitar errores.
        setOffers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || t("error_loading_offers"));
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOffers();
    }
  }, [userId, t]);

  if (loading)
    return (
      <Stack alignItems="center" sx={{ mt: 2 }}>
        <CircularProgress />
      </Stack>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  // Con la corrección de arriba, esta parte del código ya es segura,
  // pero mantener las comprobaciones explícitas es una buena práctica.
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
