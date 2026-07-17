"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

import { Offer } from "@/lib/types";

interface OfferActionsProps {
  offer: Offer;
  onOfferAction?: (action: string, id: string) => void;
  isFetching?: boolean;
}

const OfferActions: React.FC<OfferActionsProps> = ({
  offer,
  onOfferAction,
  isFetching,
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useTranslation("common");

  // No mostrar nada si está cargando o no hay usuario logueado
  if (loading || !user) return null;

  const isOwner = user?.id === offer.id_usuario_ofertante;
  const isAdmin = user?.isAdmin === true;

  const canEdit = isOwner || isAdmin;
  if (!canEdit) return null;

  return (
    <Box display="flex" gap={1}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => onOfferAction?.("edit", offer.id)}
      >
        {t("edit_button")}
      </Button>

      <Button
        size="small"
        color="error"
        variant="outlined"
        startIcon={<DeleteIcon />}
        onClick={() => onOfferAction?.("delete", offer.id)}
      >
        {t("delete_button")}
      </Button>
    </Box>
  );
};

export default OfferActions;
