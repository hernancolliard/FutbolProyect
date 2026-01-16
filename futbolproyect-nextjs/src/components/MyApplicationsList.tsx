"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Application } from "@/lib/types"; // Importamos el tipo si existe, o usamos any en el estado

// CORRECCIÓN: Definimos la interfaz para evitar errores de compilación
interface MyApplicationsListProps {
  userId: string | number; // Aceptamos ambos para evitar el error de tipos
  isOwnProfile?: boolean;
  isAdmin?: boolean;
}

function MyApplicationsList({
  userId,
  isOwnProfile,
  isAdmin,
}: MyApplicationsListProps) {
  const { t } = useTranslation("common");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        // userId se convierte a string automáticamente en el template literal, así que es seguro
        const response = await apiClient.get(
          `/profiles/${userId}/applications`,
        );
        setApplications(response.data);
      } catch (err: any) {
        setError(
          err.message ||
            t("error_loading_applications", "Error al cargar postulaciones."),
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
        <Typography sx={{ ml: 2 }}>
          {t("loading_applications", "Cargando postulaciones...")}
        </Typography>
      </Stack>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (applications.length === 0) {
    return (
      <Typography>
        {t("no_applications_yet", "Aún no tienes postulaciones.")}
      </Typography>
    );
  }
  return (
    <Stack className="my-lists-section" spacing={2} sx={{ mt: 2 }}>
      <Typography variant="h6">
        {t("my_applications_title", "Mis Postulaciones")}
      </Typography>
      <Stack className="applications-list" spacing={2}>
        {applications.map((app) => (
          <Card key={app.id} className="application-item">
            <CardContent>
              <Typography
                variant="h6"
                component={Link}
                href={`/offers/${app.oferta_id}`}
                sx={{ textDecoration: "none" }}
              >
                {app.oferta_titulo}
              </Typography>
              <Typography>
                <strong>{t("status", "Estado")}:</strong> {app.estado}
              </Typography>
              <Typography>
                <strong>{t("date", "Fecha")}:</strong>{" "}
                {new Date(app.fecha_postulacion).toLocaleDateString()}
              </Typography>
              {/* CORRECCIÓN: Verificamos si la propiedad existe en el tipo Application, si no, casteamos a any si es dinámica */}
              {(app as any).mensaje_presentacion && (
                <Typography>
                  <strong>{t("message", "Mensaje")}:</strong>{" "}
                  {(app as any).mensaje_presentacion}
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
