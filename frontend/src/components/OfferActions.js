import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../services/api';

const applyToOffer = async (offerId) => {
  const { data } = await apiClient.post(`/offers/${offerId}/apply`);
  return data;
};

function OfferActions({ offer, onOfferAction, isFetching }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: handleApply, isLoading: isApplying } = useMutation({
    mutationFn: () => applyToOffer(offer.id),
    onMutate: async () => {
      // Cancelar queries para evitar sobreescribir la actualización optimista
      await queryClient.cancelQueries({ queryKey: ['offers'] });
      await queryClient.cancelQueries({ queryKey: ['offer', offer.id] });

      // Guardar el estado previo
      const previousOfferDetail = queryClient.getQueryData(['offer', offer.id]);
      const previousOfferLists = queryClient.getQueriesData(['offers']);

      // Actualización optimista para la página de detalle
      if (previousOfferDetail) {
        queryClient.setQueryData(['offer', offer.id], (old) => ({
          ...old,
          is_applied_optimistic: true,
        }));
      }

      // Actualización optimista para todas las listas de ofertas
      queryClient.setQueriesData({ queryKey: ['offers'] }, (oldData) => {
        if (!oldData || !oldData.offers) return oldData;
        const newOffers = oldData.offers.map(o => 
            o.id === offer.id ? { ...o, is_applied_optimistic: true } : o
        );
        return { ...oldData, offers: newOffers };
      });

      return { previousOfferDetail, previousOfferLists };
    },
    onError: (err, _, context) => {
      // Revertir en caso de error
      if (context.previousOfferDetail) {
        queryClient.setQueryData(['offer', offer.id], context.previousOfferDetail);
      }
      context.previousOfferLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      const errorMessage = err.response?.data?.message || t('apply_error_generic');
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Resincronizar con el servidor
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', offer.id] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onSuccess: () => {
      toast.success(t('apply_success'));
    },
  });

  if (!user) {
    return null;
  }

  const isOwner = user && offer.id_usuario_ofertante === user.id;
  const isAdmin = user && user.role === 'admin';
  const canApply = user && !isOwner && !isAdmin;
  const hasApplied = offer.is_applied_optimistic || offer.is_applied; // Considera el estado real y el optimista

  return (
    <>
      {/* Los botones de editar/eliminar siguen usando la prop para acciones del padre */}
      {(isOwner || isAdmin) && onOfferAction && (
        <>
          <Button size="small" onClick={() => onOfferAction('edit', offer.id)} disabled={isFetching}>
            {t('edit')}
          </Button>
          <Button size="small" color="error" onClick={() => onOfferAction('delete', offer.id)} disabled={isFetching}>
            {t('delete')}
          </Button>
        </>
      )}

      {/* El botón de postularse ahora tiene su propia lógica */}
      {canApply && (
        <Button variant="contained" onClick={handleApply} disabled={isApplying || hasApplied}>
          {isApplying ? t('applying') : hasApplied ? t('applied') : t('apply')}
        </Button>
      )}
    </>
  );
}

export default OfferActions;