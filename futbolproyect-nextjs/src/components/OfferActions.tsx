'use client';

import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext"; // Migrated AuthContext // Migrated AuthContext
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient'; // Centralized apiClient
import { useRouter } from 'next/navigation'; // Import useRouter

const applyToOffer = async (offerId) => {
  const { data } = await apiClient.post(`/offers/${offerId}/apply`);
  return data;
};

const fetchUserProfile = async (userId) => {
    const { data } = await apiClient.get(`/profiles/${userId}`);
    return data;
}

function OfferActions({ offer, onOfferAction, isFetching }) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize useRouter

  const { mutate: performApply, isLoading: isApplying } = useMutation({
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

      const errorMessage = err.message || t('apply_error_generic', 'Error genérico al postularse.');
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Resincronizar con el servidor
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', offer.id] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onSuccess: () => {
      toast.success(t('apply_success', '¡Postulación exitosa!'));
    },
  });

  const handleApplyClick = async () => {
    try {
      const userProfile = await fetchUserProfile(user.id);
      const { foto_perfil_url, altura_cm, peso_kg, pie_dominante, fecha_de_nacimiento } = userProfile;

      const isProfileComplete = foto_perfil_url && altura_cm && peso_kg && pie_dominante && fecha_de_nacimiento;

      if (!isProfileComplete) {
        toast.error(t('complete_profile_to_apply', 'Debes completar tu perfil (foto y datos físicos) antes de postularte.'));
        router.push(`/profile/${user.id}`); // Use router.push
      } else {
        performApply();
      }
    } catch (error) {
      toast.error(t('profile_check_error', 'Error al verificar tu perfil. Inténtalo de nuevo.'));
    }
  };


  if (!user) {
    return null;
  }

  const isOwner = user && offer.id_usuario_ofertante === user.id;
  const isAdmin = user && user.isadmin; // Assuming 'isadmin' is the correct property for admin status
  const canApply = user && !isOwner && !isAdmin;
  const hasApplied = offer.is_applied_optimistic || offer.is_applied; // Considera el estado real y el optimista

  return (
    <>
      {/* Los botones de editar/eliminar siguen usando la prop para acciones del padre */}
      {(isOwner || isAdmin) && onOfferAction && (
        <>
          <Button size="small" onClick={() => onOfferAction('edit', offer.id)} disabled={isFetching}>
            {t('edit', 'Editar')}
          </Button>
          <Button size="small" color="error" onClick={() => onOfferAction('delete', offer.id)} disabled={isFetching}>
            {t('delete', 'Eliminar')}
          </Button>
        </>
      )}

      {/* El botón de postularse ahora tiene su propia lógica */}
      {canApply && (
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            handleApplyClick();
          }}
          disabled={isApplying || hasApplied}
        >
          {isApplying ? t('applying', 'Postulando...') : hasApplied ? t('applied', 'Postulado') : t('apply', 'Postularse')}
        </Button>
      )}
    </>
  );
}

export default OfferActions;
