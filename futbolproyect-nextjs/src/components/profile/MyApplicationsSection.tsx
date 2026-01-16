"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Card,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Application } from "@/lib/types";
import Link from "next/link";

// CORRECCIÓN: userId acepta string | number
interface MyApplicationsSectionProps {
  userId: string | number;
}

// CORRECCIÓN: fetch acepta string | number
const fetchUserApplications = async (
  userId: string | number,
): Promise<Application[]> => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const res = await fetch(`${apiUrl}/api/applications/user/${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch applications");
  }
  return res.json();
};

export default function MyApplicationsSection({
  userId,
}: MyApplicationsSectionProps) {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserApplications(userId);
        setApplications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadApplications();
  }, [userId]);

  return (
    <Stack sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {t("my_applications_title", "Mis Postulaciones")}
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : applications.length > 0 ? (
        <Stack spacing={2}>
          {applications.map((app) => (
            <Card key={app.id} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6">{app.oferta_titulo}</Typography>
              <Typography variant="body2">
                <strong>{t("status", "Estado")}:</strong> {app.estado}
              </Typography>
              <Typography variant="body2">
                <strong>{t("date", "Fecha")}:</strong>{" "}
                {new Date(app.fecha_postulacion).toLocaleDateString()}
              </Typography>
              <Button
                component={Link}
                href={`/offers/${app.oferta_id}`}
                size="small"
                sx={{ mt: 1 }}
              >
                {t("view_offer", "Ver Oferta")}
              </Button>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography>
          {t("no_applications_yet", "Aún no tienes postulaciones.")}
        </Typography>
      )}
    </Stack>
  );
}
