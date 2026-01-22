"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Offer } from "@/lib/types";

interface OfferActionsProps {
  offer: Offer;
  onOfferAction?: (action: string, id: string) => void;
  isFetching?: boolean;
}

const OfferActions: React.FC<OfferActionsProps> = ({
  offer,
  onOfferAction,
}) => {
  const router = useRouter();
  const { user } = useAuth();

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
        Editar
      </Button>

      <Button
        size="small"
        color="error"
        variant="outlined"
        startIcon={<DeleteIcon />}
        onClick={() => onOfferAction?.("delete", offer.id)}
      >
        Eliminar
      </Button>
    </Box>
  );
};

export default OfferActions;
