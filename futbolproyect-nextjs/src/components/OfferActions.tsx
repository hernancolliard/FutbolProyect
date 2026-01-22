"use client";

import React from "react";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

/* =========================
   TIPOS
========================= */
interface Offer {
  id: string;
  id_usuario_ofertante: string;
  is_applied?: boolean;
  is_applied_optimistic?: boolean;
}

interface OfferActionsProps {
  offer: Offer;
  onOfferAction?: (action: "edit" | "delete", id: string) => void;
  isFetching?: boolean;
}

/* =========================
   API
========================= */
const applyToOffer = async (offerId: string) => {
  const { data } = await apiClient.post(`/offers/${offerId}/apply`);
  return data;
};

const fetchUserProfile = async (userId: string) => {
  const { data } = await apiClient.get(`/profiles/${userId}`);
  return data;
};

/* =========================
   COMPONENTE
========================= */
export default function OfferActions({
  offer,
  onOfferAction,
  isFetching,
}: OfferActionsProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: apply, isPending: isApplying } = useMutation({
    mutationFn: () => applyToOffer(offer.id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["offer", offer.id] });
      await queryClient.cancelQueries({ queryKey: ["offers"] });

      const previousOffer = queryClient.getQueryData<Offer>([
        "offer",
        offer.id,
      ]);
      const previousOffers = queryClient.getQueryData<Offer[]>(["offers"]);

      if (previousOffer) {
        queryClient.setQueryData(["offer", offer.id], {
          ...previousOffer,
          is_applied_optimistic: true,
        });
      }

      if (previousOffers) {
        queryClient.setQueryData(
          ["offers"],
          previousOffers.map((o) =>
            o.id === offer.id ? { ...o, is_applied_optimistic: true } : o,
          ),
        );
      }

      return { previousOffer, previousOffers };
    },

    onError: (err: any, _, context) => {
      if (context?.previousOffer) {
        queryClient.setQueryData(["offer", offer.id], context.previousOffer);
      }
      if (context?.previousOffers) {
        queryClient.setQueryData(["offers"], context.previousOffers);
      }

      toast.error(
        err?.message || t("apply_error_generic", "Error al postularse"),
      );
    },

    onSuccess: () => {
      toast.success(t("apply_success", "¡Postulación exitosa!"));
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", offer.id] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  /* =========================
     HANDLERS
  ========================= */
  const handleApplyClick = async () => {
    if (!user) {
      toast.error(
        t("must_be_logged_in_to_apply", "Debes iniciar sesión para postularte"),
      );
      return;
    }

    try {
      const profile = await fetchUserProfile(user.id);

      const isProfileComplete =
        profile?.foto_perfil_url &&
        profile?.altura_cm &&
        profile?.peso_kg &&
        profile?.pie_dominante &&
        profile?.fecha_de_nacimiento;

      if (!isProfileComplete) {
        toast.error(
          t(
            "complete_profile_to_apply",
            "Completa tu perfil antes de postularte",
          ),
        );
        router.push(`/profile/${user.id}`);
        return;
      }

      apply();
    } catch {
      toast.error(t("profile_check_error", "Error al verificar tu perfil"));
    }
  };

  /* =========================
     PERMISOS
  ========================= */
  if (!user) return null;

  const isOwner = user.id === offer.id_usuario_ofertante;
  const isAdmin = user.isAdmin === true;
  const canApply = !isOwner && !isAdmin;
  const hasApplied = offer.is_applied || offer.is_applied_optimistic;

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      {(isOwner || isAdmin) && onOfferAction && (
        <>
          <Button
            size="small"
            onClick={() => onOfferAction("edit", offer.id)}
            disabled={isFetching}
          >
            {t("edit", "Editar")}
          </Button>

          <Button
            size="small"
            color="error"
            onClick={() => onOfferAction("delete", offer.id)}
            disabled={isFetching}
          >
            {t("delete", "Eliminar")}
          </Button>
        </>
      )}

      {canApply && (
        <Button
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            handleApplyClick();
          }}
          disabled={isApplying || hasApplied}
        >
          {isApplying
            ? t("applying", "Postulando...")
            : hasApplied
              ? t("applied", "Postulado")
              : t("apply", "Postularse")}
        </Button>
      )}
    </>
  );
}
