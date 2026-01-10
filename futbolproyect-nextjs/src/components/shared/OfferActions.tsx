'use client';

import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
// import apiClient from "../services/api"; // Need to migrate apiClient
// import { useAuth } from "../context/AuthContext"; // AuthContext not yet migrated

// Mock apiClient for now
const apiClient = {
    post: async (url: string, data: any) => {
        console.log(`Mock API POST to ${url} with data:`, data);
        return { data: { message: "Mock success" } };
    },
};

// Mock AuthContext for now
const useAuth = () => {
    const user = {
        id: "1", // Ensure id is string for consistency
        nombre: "MockUser",
        isadmin: true,
        tipo_usuario: "postulante", // For testing apply functionality
        id_usuario_ofertante: "mock_offer_owner_id", // For testing owner actions
    };
    return { user };
};

// Define types for Offer
interface Offer {
  id: string;
  id_usuario_ofertante: string;
  applicants?: { user_id: string }[];
  // Add other offer properties as needed
}

interface OfferActionsProps {
    offer: Offer;
    onOfferAction?: (action: string, id: string) => void;
}

const OfferActions = ({ offer, onOfferAction }: OfferActionsProps) => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Using mock auth for now
  const queryClient = useQueryClient();
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [applicantMessage, setApplicantMessage] = useState("");

  const hasApplied = offer.applicants?.some(applicant => applicant.user_id === user?.id);
  const isOwner = user && user.id === offer.id_usuario_ofertante;
  const isAdmin = user && user.isadmin;

  // Mutation for applying to an offer
  const applyMutation = useMutation({
    mutationFn: (applicationData: { offer_id: string, user_id: string, message: string }) => apiClient.post("/applications", applicationData),
    onSuccess: () => {
      toast.success(t("apply_success", "¡Postulación exitosa!"));
      queryClient.invalidateQueries({ queryKey: ["offer", offer.id] }); // Invalidate offer details to refresh applicants
      setOpenApplyModal(false);
    },
    onError: (error: any) => { // Use any for error for now
      toast.error(error.response?.data?.message || t("apply_error_generic", "Ocurrió un error al postular."));
    },
  });

  const handleApply = () => {
    if (!user) {
      toast.error(t("must_be_logged_in_to_apply", "Debes iniciar sesión para postularte."));
      return;
    }
    // Check if user is an applicant type
    // This logic relies on user.tipo_usuario which is from useAuth, so it's part of the mock for now
    if (user.tipo_usuario !== "postulante") {
      toast.error(t("only_applicants_can_apply", "Solo los usuarios postulantes pueden aplicar a ofertas."));
      return;
    }

    setOpenApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (user) { // Ensure user is not null
        applyMutation.mutate({ offer_id: offer.id, user_id: user.id, message: applicantMessage });
    }
  };

  const handleDelete = () => {
    if (onOfferAction) {
      onOfferAction('delete', offer.id);
    }
  };

  const handleEdit = () => {
    if (onOfferAction) {
      onOfferAction('edit', offer.id);
    }
  };

  return (
    <>
      {(isOwner || isAdmin) ? (
        // Owner/Admin actions
        <>
          <Button variant="outlined" color="primary" onClick={handleEdit} sx={{ mr: 1 }}>
            {t("edit")}
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete}>
            {t("delete")}
          </Button>
        </>
      ) : hasApplied ? (
        <Button variant="contained" disabled>
          {t("applied")}
        </Button>
      ) : (
        <Button variant="contained" color="secondary" onClick={handleApply}>
          {t("apply")}
        </Button>
      )}

      {/* Apply Modal */}
      <Dialog open={openApplyModal} onClose={() => setOpenApplyModal(false)}>
        <DialogTitle>{t("apply_to_offer", "Postularme a la oferta")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("your_message_placeholder", "Tu Mensaje")}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={applicantMessage}
            onChange={(e) => setApplicantMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApplyModal(false)}>{t("cancel_button")}</Button>
          <Button onClick={handleConfirmApply} disabled={applyMutation.isLoading}>
            {applyMutation.isLoading ? <CircularProgress size={24} /> : t("apply")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OfferActions;
