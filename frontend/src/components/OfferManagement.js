import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button, Switch } from "@mui/material";

function OfferManagement() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/offers");
      setOffers(response.data);
    } catch (error) {
      toast.error(t('fetch_offers_error'));
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (offerId) => {
    if (window.confirm(t('confirm_delete_offer'))) {
      try {
        await apiClient.delete(`/admin/offers/${offerId}`);
        toast.success(t('offer_deleted_success'));
        fetchOffers(); // Refresh the list
      } catch (error) {
        toast.error(error.response?.data?.message || t('delete_offer_error'));
        console.error("Error deleting offer:", error);
      }
    }
  };

  const handleToggleFeature = async (offerId, currentStatus) => {
    try {
      await apiClient.patch(`/admin/offers/${offerId}/toggle-feature`);
      setOffers(offers.map(o => o.id === offerId ? { ...o, is_featured: !currentStatus } : o));
      toast.success("Estado de oferta destacada actualizado.");
    } catch (error) {
      toast.error("Error al actualizar el estado de la oferta.");
      console.error("Error toggling feature status:", error);
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t('loading_offers')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('offers_title')}
      </Typography>
      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>{t('id_header')}</TableCell>
            <TableCell>{t('title_header')}</TableCell>
            <TableCell>{t('offerer_header')}</TableCell>
            <TableCell>Destacada</TableCell>
            <TableCell>{t('location_header')}</TableCell>
            <TableCell>{t('position_header')}</TableCell>
            <TableCell>{t('published_date_header')}</TableCell>
            <TableCell>{t('actions_header')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell>{offer.id}</TableCell>
              <TableCell>{offer.titulo}</TableCell>
              <TableCell>{offer.nombre_ofertante}</TableCell>
              <TableCell>
                <Switch
                  checked={offer.is_featured}
                  onChange={() => handleToggleFeature(offer.id, offer.is_featured)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </TableCell>
              <TableCell>{offer.ubicacion}</TableCell>
              <TableCell>{offer.puesto}</TableCell>
              <TableCell>
                {new Date(offer.fecha_publicacion).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => navigate(`/edit-offer/${offer.id}`)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  {t('edit_button')}
                </Button>
                <Button
                  onClick={() => handleDelete(offer.id)}
                  variant="outlined"
                  color="error"
                >
                  {t('delete_button')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OfferManagement;
