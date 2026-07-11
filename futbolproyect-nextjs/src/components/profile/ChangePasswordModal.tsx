"use client";

import React, { FormEvent, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import apiClient from "@/lib/apiClient";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const closeModal = () => {
    if (saving) return;
    setForm(emptyForm);
    setError("");
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await apiClient.put("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success(data?.message || "Contraseña actualizada correctamente.");
      setForm(emptyForm);
      onClose();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "No se pudo actualizar la contraseña.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={closeModal} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ingresá tu contraseña actual y elegí una nueva de al menos 8
              caracteres.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Contraseña actual"
              type="password"
              value={form.currentPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              autoComplete="current-password"
              required
              fullWidth
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              value={form.newPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              autoComplete="new-password"
              inputProps={{ minLength: 8 }}
              required
              fullWidth
            />
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              autoComplete="new-password"
              inputProps={{ minLength: 8 }}
              required
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeModal} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} color="inherit" /> : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
