"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";
import { getProfilePath } from "@/lib/seoSlugs";

type Applicant = {
  id: number;
  id_usuario: number;
  nombre: string;
  apellido?: string;
  email: string;
  fecha_postulacion: string;
  estado: string;
  posicion_principal?: string;
  nacionalidad?: string;
  telefono?: string;
  cv_url?: string;
  average_rating?: number;
  total_ratings?: number;
};

const statusOptions = [
  { value: "enviada", labelKey: "application_status_sent", fallback: "Enviada" },
  { value: "en_revision", labelKey: "application_status_review", fallback: "En revisión" },
  { value: "preseleccionado", labelKey: "application_status_shortlisted", fallback: "Preseleccionado" },
  { value: "rechazada", labelKey: "application_status_rejected", fallback: "Rechazada" },
  { value: "contratado", labelKey: "application_status_hired", fallback: "Contratado" },
];

export default function ApplicantsPage() {
  const { t } = useTranslation("common");
  const { user, loading: authLoading } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const params = useParams();
  const offerId = params.offerId;
  const isAdmin = Boolean(user?.isadmin || user?.isAdmin);
  const hasOfferManagementAccess = Boolean(
    isAdmin ||
      (["ofertante", "agencia"].includes(user?.tipo_usuario) &&
        hasCompatibleActiveSubscription(user)),
  );

  const statusCounts = useMemo(() => {
    return applicants.reduce<Record<string, number>>((acc, applicant) => {
      acc[applicant.estado] = (acc[applicant.estado] || 0) + 1;
      return acc;
    }, {});
  }, [applicants]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (authLoading) return;
      if (!hasOfferManagementAccess) {
        setLoading(false);
        return;
      }
      if (!offerId) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/offers/${offerId}/applications`);
        setApplicants(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            t("error_loading_applicants_page", "Error al cargar la página de postulantes."),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [authLoading, hasOfferManagementAccess, offerId, t]);

  const handleStatusChange = async (applicationId: number, estado: string) => {
    setUpdatingId(applicationId);
    try {
      await apiClient.patch(`/offers/${offerId}/applications/${applicationId}/status`, {
        estado,
      });
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicationId ? { ...applicant, estado } : applicant,
        ),
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner text={t("loading_applicants_page", "Cargando postulantes...")} />;
  }

  if (!hasOfferManagementAccess) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="info">
          {t("offer_management_subscription_gate_description")}
        </Alert>
        <Button component={Link} href="/suscripcion" variant="contained">
          {t("view_subscription_plans")}
        </Button>
      </Stack>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t("applicants_for_offer_title", "Postulantes para la Oferta")}
          </Typography>
          <Typography color="text.secondary">
            {t(
              "applicants_dashboard_subtitle",
              "Gestiona estados, revisa datos clave y abre el perfil completo de cada candidato.",
            )}
          </Typography>
        </div>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          <Chip label={`${t("applications", "Postulaciones")}: ${applicants.length}`} />
          {statusOptions.map((status) => (
            <Chip
              key={status.value}
              variant="outlined"
              label={`${t(status.labelKey, status.fallback)}: ${statusCounts[status.value] || 0}`}
            />
          ))}
        </Stack>
      </Stack>

      {applicants.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography align="center">
            {t("no_applicants_for_offer_yet", "Aún no hay postulantes para esta oferta.")}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table className="applicants-table">
            <TableHead>
              <TableRow>
                <TableCell>{t("name_th", "Nombre")}</TableCell>
                <TableCell>{t("position", "Puesto:")}</TableCell>
                <TableCell>{t("nationality", "Nacionalidad:")}</TableCell>
                <TableCell>{t("email_th", "Email")}</TableCell>
                <TableCell>{t("application_date_th", "Fecha Postulación")}</TableCell>
                <TableCell>{t("status_th", "Estado")}</TableCell>
                <TableCell>{t("actions_th", "Acciones")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {`${applicant.nombre} ${applicant.apellido || ""}`.trim()}
                    </Typography>
                    {applicant.average_rating ? (
                      <Typography variant="caption" color="text.secondary">
                        {Number(applicant.average_rating).toFixed(1)} / 5 ({applicant.total_ratings || 0})
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{applicant.posicion_principal || "-"}</TableCell>
                  <TableCell>{applicant.nacionalidad || "-"}</TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>
                    {new Date(applicant.fecha_postulacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={applicant.estado}
                        disabled={updatingId === applicant.id}
                        onChange={(event) =>
                          handleStatusChange(applicant.id, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {t(status.labelKey, status.fallback)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        component={Link}
                        href={getProfilePath({
                          id: String(applicant.id_usuario),
                          nombre: applicant.nombre,
                          apellido: applicant.apellido || "",
                          posicion_principal: applicant.posicion_principal || "",
                        })}
                        variant="outlined"
                        size="small"
                      >
                        {t("view_profile_button", "Ver Perfil")}
                      </Button>
                      {applicant.cv_url && (
                        <Button
                          component="a"
                          href={applicant.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          size="small"
                        >
                          {t("download_cv", "Descargar CV")}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
