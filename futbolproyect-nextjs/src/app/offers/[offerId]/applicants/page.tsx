'use client';

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Import useParams from next/navigation
import Link from "next/link"; // Import next/link
import apiClient from "../../../../../lib/apiClient"; // Centralized apiClient
import { useTranslation } from "react-i18next";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LoadingSpinner from "../../../../../components/LoadingSpinner"; // Migrated LoadingSpinner

export default function ApplicantsPage() {
  const { t } = useTranslation('common');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const offerId = params.offerId; // Get offerId from Next.js useParams

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!offerId) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/offers/${offerId}/applications`);
        setApplicants(response.data);
      } catch (err) {
        setError(
          err.message || t("error_loading_applicants_page", "Error al cargar la página de postulantes.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [offerId, t]);

  if (loading)
    return <LoadingSpinner text={t("loading_applicants_page", "Cargando postulantes...")} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t("applicants_for_offer_title", "Postulantes para la Oferta")}
      </Typography>
      {applicants.length === 0 ? (
        <Typography align="center" sx={{ m: 2 }}>
          {t("no_applicants_for_offer_yet", "Aún no hay postulantes para esta oferta.")}
        </Typography>
      ) : (
        <Table className="applicants-table">
          <TableHead>
            <TableRow>
              <TableCell>{t("name_th", "Nombre")}</TableCell>
              <TableCell>{t("email_th", "Email")}</TableCell>
              <TableCell>{t("application_date_th", "Fecha Postulación")}</TableCell>
              <TableCell>{t("status_th", "Estado")}</TableCell>
              <TableCell>{t("actions_th", "Acciones")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applicants.map((applicant) => (
              <TableRow key={applicant.id}>
                <TableCell>{applicant.nombre}</TableCell>
                <TableCell>{applicant.email}</TableCell>
                <TableCell>
                  {new Date(applicant.fecha_postulacion).toLocaleDateString()}
                </TableCell>
                <TableCell>{applicant.estado}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    href={`/profile/${applicant.id_usuario}`} // Use href for next/link
                    variant="outlined"
                    color="primary"
                  >
                    {t("view_profile_button", "Ver Perfil")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
