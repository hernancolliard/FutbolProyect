"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Advertisement } from "@/lib/types";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const placements = [
  { value: "home_top", label: "Home superior" },
  { value: "home_middle", label: "Home medio" },
  { value: "home_profiles", label: "Home perfiles" },
  { value: "offers_top", label: "Ofertas superior" },
  { value: "offers_inline", label: "Ofertas listado" },
  { value: "profiles_top", label: "Perfiles superior" },
  { value: "profiles_inline", label: "Perfiles listado" },
  { value: "player_profile_sidebar", label: "Detalle de perfil" },
  { value: "footer", label: "Footer" },
];

const advertiserTypes = [
  { value: "sponsor", label: "Sponsor" },
  { value: "brand", label: "Marca" },
  { value: "club", label: "Club" },
  { value: "academy", label: "Academia" },
  { value: "agency", label: "Agencia" },
  { value: "event", label: "Evento" },
];

const emptyForm = {
  title: "",
  advertiser_name: "",
  advertiser_type: "sponsor",
  image_url: "",
  target_url: "",
  placement: "home_middle",
  language: "all",
  country: "",
  description: "",
  button_text: "Ver mas",
  package_type: "",
  notes: "",
  priority: 0,
  is_active: true,
  start_date: "",
  end_date: "",
};

const formatInputDate = (value?: string) => (value ? value.slice(0, 10) : "");

export default function AdvertisementManagement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/ads/admin/advertisements");
      setAds(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar anuncios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateDialog = () => {
    setEditingAd(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setForm({
      title: ad.title || "",
      advertiser_name: ad.advertiser_name || "",
      advertiser_type: ad.advertiser_type || "sponsor",
      image_url: ad.image_url || "",
      target_url: ad.target_url || "",
      placement: ad.placement || "home_middle",
      language: ad.language || "all",
      country: ad.country || "",
      description: ad.description || "",
      button_text: ad.button_text || "Ver mas",
      package_type: ad.package_type || "",
      notes: ad.notes || "",
      priority: ad.priority || 0,
      is_active: Boolean(ad.is_active),
      start_date: formatInputDate(ad.start_date),
      end_date: formatInputDate(ad.end_date),
    });
    setDialogOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "priority" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingAd) {
        await apiClient.put(`/ads/admin/advertisements/${editingAd.id}`, form);
        toast.success("Anuncio actualizado.");
      } else {
        await apiClient.post("/ads/admin/advertisements", form);
        toast.success("Anuncio creado.");
      }
      setDialogOpen(false);
      fetchAds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo guardar el anuncio.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad: Advertisement) => {
    try {
      const { data } = await apiClient.patch(`/ads/admin/advertisements/${ad.id}/toggle`);
      setAds((prev) => prev.map((item) => (item.id === ad.id ? data : item)));
      toast.success("Estado actualizado.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!window.confirm(`Eliminar el anuncio "${ad.title}"?`)) return;

    try {
      await apiClient.delete(`/ads/admin/advertisements/${ad.id}`);
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
      toast.success("Anuncio eliminado.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo eliminar el anuncio.");
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        Cargando anuncios...
      </Typography>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">Publicidad y sponsors</Typography>
          <Typography variant="body2" color="text.secondary">
            Administra banners directos, fechas, ubicaciones y metricas.
          </Typography>
        </Box>
        <Button variant="contained" onClick={openCreateDialog}>
          Nuevo anuncio
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Los clicks redirigen por el backend para sumar metricas y agregar UTM al destino.
      </Alert>

      <TableContainer component={Paper}>
        <Table className="management-table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Anuncio</TableCell>
              <TableCell>Ubicacion</TableCell>
              <TableCell>Idioma</TableCell>
              <TableCell>Periodo</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Metricas</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.id}</TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={700}>{ad.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ad.advertiser_name}
                    </Typography>
                    <Chip size="small" label={ad.advertiser_type} sx={{ width: "fit-content" }} />
                  </Stack>
                </TableCell>
                <TableCell>{placements.find((p) => p.value === ad.placement)?.label || ad.placement}</TableCell>
                <TableCell>{ad.language}</TableCell>
                <TableCell>
                  {formatInputDate(ad.start_date) || "Sin inicio"} -{" "}
                  {formatInputDate(ad.end_date) || "Sin fin"}
                </TableCell>
                <TableCell>{ad.priority}</TableCell>
                <TableCell>
                  <Typography variant="body2">Imp: {ad.impressions_count || 0}</Typography>
                  <Typography variant="body2">Clicks: {ad.clicks_count || 0}</Typography>
                  <Typography variant="body2">CTR: {Number(ad.ctr || 0).toFixed(2)}%</Typography>
                </TableCell>
                <TableCell>
                  <Switch checked={Boolean(ad.is_active)} onChange={() => handleToggle(ad)} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => openEditDialog(ad)}>
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(ad)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center" color="text.secondary">
                    Todavia no hay anuncios cargados.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingAd ? "Editar anuncio" : "Nuevo anuncio"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField name="title" label="Titulo" value={form.title} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField name="advertiser_name" label="Anunciante" value={form.advertiser_name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select name="advertiser_type" label="Tipo" value={form.advertiser_type} onChange={handleChange} fullWidth>
                {advertiserTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select name="placement" label="Ubicacion" value={form.placement} onChange={handleChange} fullWidth>
                {placements.map((placement) => (
                  <MenuItem key={placement.value} value={placement.value}>
                    {placement.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select name="language" label="Idioma" value={form.language} onChange={handleChange} fullWidth>
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="es">Espanol</MenuItem>
                <MenuItem value="en">Ingles</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField name="image_url" label="URL de imagen/banner" value={form.image_url} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField name="target_url" label="URL destino" value={form.target_url} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField name="description" label="Descripcion" value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="button_text" label="Texto boton" value={form.button_text} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="country" label="Pais/mercado" value={form.country} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="package_type" label="Paquete" value={form.package_type} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="number" name="priority" label="Prioridad" value={form.priority} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" name="start_date" label="Fecha inicio" value={form.start_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" name="end_date" label="Fecha fin" value={form.end_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Notas internas" value={form.notes} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch name="is_active" checked={form.is_active} onChange={handleChange} />
                <Typography>Activo</Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
