import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../services/api";
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
import LoadingSpinner from "./LoadingSpinner";

function ApplicantsPage() {
  const { t } = useTranslation();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { offerId } = useParams();

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!offerId) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/offers/${offerId}/applications`);
        setApplicants(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || t("error_loading_applicants_page")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [offerId, t]);

  if (loading)
    return <LoadingSpinner text={t("loading_applicants_page")} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t("applicants_for_offer_title")}
      </Typography>
      {applicants.length === 0 ? (
        <Typography align="center" sx={{ m: 2 }}>
          {t("no_applicants_for_offer_yet")}
        </Typography>
      ) : (
        <Table className="applicants-table">
          <TableHead>
            <TableRow>
              <TableCell>{t("name_th")}</TableCell>
              <TableCell>{t("email_th")}</TableCell>
              <TableCell>{t("application_date_th")}</TableCell>
              <TableCell>{t("status_th")}</TableCell>
              <TableCell>{t("actions_th")}</TableCell>
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
                    to={`/profile/${applicant.id_usuario}`}
                    variant="outlined"
                    color="primary"
                  >
                    {t("view_profile_button")}
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

export default ApplicantsPage;
