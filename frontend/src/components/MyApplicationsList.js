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

function MyApplicationsList({ userId, isOwnProfile, isAdmin }) {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get(
          `/profiles/${userId}/applications`
        );
        setApplications(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || t("error_loading_applications")
        );
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchApplications();
    }
  }, [userId, t]);

  if (loading)
    return (
      <Stack alignItems="center" sx={{ mt: 2 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t("loading_applications")}</Typography>
      </Stack>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (applications.length === 0) {
    return <Typography>{t("no_applications_yet")}</Typography>;
  }
  return (
    <Stack className="my-lists-section" spacing={2} sx={{ mt: 2 }}>
      <Typography variant="h6">{t("my_applications_title")}</Typography>
      <Stack className="applications-list" spacing={2}>
        {applications.map((app) => (
          <Card key={app.id} className="application-item">
            <CardContent>
              <Typography
                variant="h6"
                component={Link}
                to={`/offers/${app.oferta_id}`}
                sx={{ textDecoration: "none" }}
              >
                {app.oferta_titulo}
              </Typography>
              <Typography>
                <strong>{t("status")}</strong> {app.estado}
              </Typography>
              <Typography>
                <strong>{t("date")}</strong>{" "}
                {new Date(app.fecha_postulacion).toLocaleDateString()}
              </Typography>
              {app.mensaje_presentacion && (
                <Typography>
                  <strong>{t("message")}</strong> {app.mensaje_presentacion}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default MyApplicationsList;
