"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface OfferActionsProps {
  offerId: number;
  ownerId: number; // ID del usuario dueño de la oferta
  onDelete?: () => void;
}

const OfferActions: React.FC<OfferActionsProps> = ({
  offerId,
  ownerId,
  onDelete,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // 🔐 Verificar si el usuario es dueño
  const isOwner = user?.id === ownerId;
  const isAdmin = user?.isadmin === true;

  // Admin o dueño pueden editar
  const canEdit = isOwner || isAdmin;

  if (!canEdit) return null; // ⛔ No mostrar nada

  return (
    <Box display="flex" gap={1}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={() => router.push(`/offers/${offerId}/edit`)}
      >
        Editar
      </Button>

      {onDelete && (
        <Button
          size="small"
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Eliminar
        </Button>
      )}
    </Box>
  );
};

export default OfferActions;
