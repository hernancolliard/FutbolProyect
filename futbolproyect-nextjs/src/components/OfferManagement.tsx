'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import apiClient from "@/lib/apiClient"; // Centralized apiClient
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button, Switch } from "@mui/material";

function OfferManagement() {
  const { t, i18n } = useTranslation('common');
  const language = i18n.language?.startsWith('en') ? 'en' : 'es';
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/admin/offers");
      setOffers(response.data);
    } catch (error) {
      toast.error(error.message || t('fetch_offers_error', 'Error al cargar ofertas.'));
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (offerId) => {
    if (window.confirm(t('confirm_delete_offer', '¿Estás seguro de que quieres eliminar esta oferta?'))) {
      try {
        await apiClient.delete(`/admin/offers/${offerId}`);
        toast.success(t('offer_deleted_success', 'Oferta eliminada con éxito.'));
        fetchOffers(); // Refresh the list
      } catch (error) {
        toast.error(error.message || t('delete_offer_error', 'Error al eliminar oferta.'));
        console.error("Error deleting offer:", error);
      }
    }
  };

  const handleToggleFeature = async (offerId, currentStatus) => {
    try {
      await apiClient.patch(`/admin/offers/${offerId}/toggle-feature`);
      setOffers(offers.map(o => o.id === offerId ? { ...o, is_featured: !currentStatus } : o));
      toast.success(t('offer_feature_updated', "Estado de oferta destacada actualizado."));
    } catch (error) {
      toast.error(error.message || t('offer_feature_error', "Error al actualizar el estado de la oferta."));
      console.error("Error toggling feature status:", error);
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t('loading_offers', 'Cargando ofertas...')}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ m: 2 }}>
        {t('offers_title', 'Gestión de Ofertas')}
      </Typography>
      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>{t('id_header', 'ID')}</TableCell>
            <TableCell>{t('title_header', 'Título')}</TableCell>
            <TableCell>{t('offerer_header', 'Oferente')}</TableCell>
            <TableCell>{t('featured_header', 'Destacada')}</TableCell>
            <TableCell>{t('applications_header', 'Postulaciones')}</TableCell>
            <TableCell>{t('location_header', 'Ubicación')}</TableCell>
            <TableCell>{t('position_header', 'Puesto')}</TableCell>
            <TableCell>{t('published_date_header', 'Fecha Publicación')}</TableCell>
            <TableCell>{t('actions_header', 'Acciones')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell>{offer.id}</TableCell>
              <TableCell>{offer[`titulo_${language}`] || offer.titulo}</TableCell>
              <TableCell>{offer.nombre_ofertante}</TableCell>
              <TableCell>
                <Switch
                  checked={offer.is_featured}
                  onChange={() => handleToggleFeature(offer.id, offer.is_featured)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </TableCell>
              <TableCell>{offer.application_count}</TableCell>
              <TableCell>{offer.ubicacion}</TableCell>
              <TableCell>{offer.puesto}</TableCell>
              <TableCell>
                {new Date(offer.fecha_publicacion).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => router.push(`/offers/${offer.id}/applicants`)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  {t('view_applicants_button', 'Ver Postulantes')}
                </Button>
                <Button
                  onClick={() => router.push(`/edit-offer/${offer.id}`)}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  {t('edit_button', 'Editar')}
                </Button>
                <Button
                  onClick={() => handleDelete(offer.id)}
                  variant="outlined"
                  color="error"
                >
                  {t('delete_button', 'Eliminar')}
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
