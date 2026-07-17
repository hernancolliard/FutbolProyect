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
import { useTranslation } from "react-i18next";

const placements = [
  { value: "home_top", labelKey: "ad_placement_home_top" },
  { value: "home_middle", labelKey: "ad_placement_home_middle" },
  { value: "home_profiles", labelKey: "ad_placement_home_profiles" },
  { value: "offers_top", labelKey: "ad_placement_offers_top" },
  { value: "offers_inline", labelKey: "ad_placement_offers_inline" },
  { value: "profiles_top", labelKey: "ad_placement_profiles_top" },
  { value: "profiles_inline", labelKey: "ad_placement_profiles_inline" },
  { value: "player_profile_sidebar", labelKey: "ad_placement_profile_detail" },
  { value: "footer", labelKey: "ad_placement_footer" },
];

const advertiserTypes = [
  { value: "sponsor", labelKey: "advertiser_sponsor" },
  { value: "brand", labelKey: "advertising_type_sports_brand" },
  { value: "club", labelKey: "advertising_type_club" },
  { value: "academy", labelKey: "advertising_type_academy" },
  { value: "agency", labelKey: "advertising_type_agency" },
  { value: "event", labelKey: "advertising_type_event" },
];

const emptyForm = {
  title: "",
  advertiser_name: "",
  advertiser_type: "sponsor",
  image_url: "",
  target_url: "",
  placement: ["home_middle"],
  language: "all",
  country: "",
  description: "",
  button_text: "",
  package_type: "",
  notes: "",
  priority: 0,
  is_active: true,
  start_date: "",
  end_date: "",
};

const formatInputDate = (value?: string) => (value ? value.slice(0, 10) : "");

export default function AdvertisementManagement() {
  const { t } = useTranslation("common");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/ads/admin/advertisements");
      setAds(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("ads_load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreateDialog = () => {
    setEditingAd(null);
    setForm({ ...emptyForm, button_text: t("see_more") });
    setImageFile(null);
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
      placement: [ad.placement || "home_middle"],
      language: ad.language || "all",
      country: ad.country || "",
      description: ad.description || "",
      button_text: ad.button_text || t("see_more"),
      package_type: ad.package_type || "",
      notes: ad.notes || "",
      priority: ad.priority || 0,
      is_active: Boolean(ad.is_active),
      start_date: formatInputDate(ad.start_date),
      end_date: formatInputDate(ad.end_date),
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "priority"
            ? Number(value)
            : name === "placement"
              ? typeof value === "string"
                ? value.split(",")
                : value
              : value,
    }));
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const uploadSelectedImage = async () => {
    if (!imageFile) return form.image_url;

    const data = new FormData();
    data.append("image", imageFile);

    const response = await apiClient.post("/ads/admin/upload-image", data);
    return response.data.image_url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const imageUrl = await uploadSelectedImage();
      const payload = {
        ...form,
        image_url: imageUrl,
        placement: editingAd ? form.placement[0] : form.placement,
        placements: editingAd ? undefined : form.placement,
      };

      if (editingAd) {
        await apiClient.put(`/ads/admin/advertisements/${editingAd.id}`, payload);
        toast.success(t("ad_updated"));
      } else {
        await apiClient.post("/ads/admin/advertisements", payload);
        toast.success(
          form.placement.length > 1
            ? t("ads_created_for_placements")
            : t("ad_created"),
        );
      }
      setDialogOpen(false);
      fetchAds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("ad_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad: Advertisement) => {
    try {
      const { data } = await apiClient.patch(`/ads/admin/advertisements/${ad.id}/toggle`);
      setAds((prev) => prev.map((item) => (item.id === ad.id ? data : item)));
      toast.success(t("status_updated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("status_change_error"));
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!window.confirm(t("confirm_delete_ad", { title: ad.title }))) return;

    try {
      await apiClient.delete(`/ads/admin/advertisements/${ad.id}`);
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
      toast.success(t("ad_deleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("ad_delete_error"));
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t("loading_ads")}
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
          <Typography variant="h5">{t("ads_management_title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("ads_management_subtitle")}
          </Typography>
        </Box>
        <Button variant="contained" onClick={openCreateDialog}>
          {t("new_ad")}
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        {t("ads_redirect_metrics_help")}
      </Alert>

      <TableContainer component={Paper}>
        <Table className="management-table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>{t("advertisement")}</TableCell>
              <TableCell>{t("placement")}</TableCell>
              <TableCell>{t("language")}</TableCell>
              <TableCell>{t("period")}</TableCell>
              <TableCell>{t("priority")}</TableCell>
              <TableCell>{t("metrics")}</TableCell>
              <TableCell>{t("active")}</TableCell>
              <TableCell>{t("actions")}</TableCell>
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
                <TableCell>{t(placements.find((p) => p.value === ad.placement)?.labelKey || ad.placement)}</TableCell>
                <TableCell>{ad.language}</TableCell>
                <TableCell>
                  {formatInputDate(ad.start_date) || t("no_start_date")} -{" "}
                  {formatInputDate(ad.end_date) || t("no_end_date")}
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
                      {t("edit_button")}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(ad)}
                    >
                      {t("delete_button")}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center" color="text.secondary">
                    {t("no_ads")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingAd ? t("edit_ad") : t("new_ad")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField name="title" label={t("title_label")} value={form.title} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField name="advertiser_name" label={t("advertiser")} value={form.advertiser_name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select name="advertiser_type" label={t("type")} value={form.advertiser_type} onChange={handleChange} fullWidth>
                {advertiserTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {t(type.labelKey)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                name="placement"
                label={editingAd ? t("placement") : t("ad_placements")}
                value={editingAd ? form.placement[0] : form.placement}
                onChange={handleChange}
                fullWidth
                SelectProps={{
                  multiple: !editingAd,
                  renderValue: (selected) =>
                    Array.isArray(selected)
                      ? selected
                          .map((value) => t(placements.find((item) => item.value === value)?.labelKey || value))
                          .join(", ")
                      : t(placements.find((item) => item.value === selected)?.labelKey || String(selected)),
                }}
                helperText={
                  editingAd
                    ? t("edit_specific_placement_help")
                    : t("multiple_placements_help")
                }
              >
                {placements.map((placement) => (
                  <MenuItem key={placement.value} value={placement.value}>
                    {t(placement.labelKey)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select name="language" label={t("language")} value={form.language} onChange={handleChange} fullWidth>
                <MenuItem value="all">{t("all_languages")}</MenuItem>
                <MenuItem value="es">{t("spanish")}</MenuItem>
                <MenuItem value="en">{t("english")}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <TextField
                  name="image_url"
                  label={t("banner_image_url")}
                  value={form.image_url}
                  onChange={handleChange}
                  fullWidth
                  helperText={t("banner_image_help")}
                />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Button variant="outlined" component="label">
                    {t("upload_image")}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {imageFile ? imageFile.name : t("no_file_selected_short")}
                  </Typography>
                </Stack>
                {(form.image_url || imageFile) && (
                  <Alert severity="info">
                    {imageFile
                      ? t("banner_upload_on_save_help")
                      : t("banner_url_usage_help")}
                  </Alert>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField name="target_url" label={t("target_url")} value={form.target_url} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField name="description" label={t("description_label")} value={form.description} onChange={handleChange} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="button_text" label={t("button_text")} value={form.button_text} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="country" label={t("country_market")} value={form.country} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="package_type" label={t("package")} value={form.package_type} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="number" name="priority" label={t("priority")} value={form.priority} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" name="start_date" label={t("start_date")} value={form.start_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" name="end_date" label={t("ad_end_date")} value={form.end_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label={t("internal_notes")} value={form.notes} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch name="is_active" checked={form.is_active} onChange={handleChange} />
                <Typography>{t("active")}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
