"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import apiClient from "@/lib/apiClient";
import {
  CareerClubValue,
  ClubOption,
  getSafeClubLogoUrl,
} from "@/lib/clubCrests";

interface CareerClubSelectorProps {
  value: CareerClubValue;
  onChange: (patch: Partial<CareerClubValue>) => void;
}

const MAX_CUSTOM_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_CUSTOM_LOGO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function CareerClubSelector({
  value,
  onChange,
}: CareerClubSelectorProps) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ClubOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = useMemo(
    () => getSafeClubLogoUrl(value.logo_url),
    [value.logo_url],
  );

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    const query = value.club.trim();
    if (query.length < 2) {
      setOptions([]);
      setSearching(false);
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await apiClient.get<ClubOption[]>("/clubs", {
          params: { q: query, limit: 20 },
        });
        if (active) setOptions(response.data);
      } catch {
        if (active) setOptions([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [value.club]);

  const handleTypedClub = (club: string) => {
    const catalogLogoPatch =
      value.logo_source === "catalog"
        ? { logo_url: "", logo_source: "" as const }
        : {};
    onChange({ club, club_id: null, ...catalogLogoPatch });
  };

  const handleSelection = (selected: ClubOption | string | null) => {
    if (!selected) {
      handleTypedClub(value.club);
      return;
    }
    if (typeof selected === "string") {
      handleTypedClub(selected);
      return;
    }

    onChange({
      club_id: selected.id,
      club: selected.name,
      league: selected.league || "",
      country: selected.country,
      logo_url: selected.logo_url || "",
      logo_source: "catalog",
    });
  };

  const handleLogoUpload = async (file?: File) => {
    setUploadError("");
    if (!file) return;
    if (!value.club.trim()) {
      setUploadError(t("club_name_before_logo", "Primero escribí el nombre del club."));
      return;
    }
    if (!ALLOWED_CUSTOM_LOGO_TYPES.has(file.type)) {
      setUploadError(t("club_logo_format_error", "El logo debe ser PNG, JPG o WebP."));
      return;
    }
    if (file.size > MAX_CUSTOM_LOGO_BYTES) {
      setUploadError(t("club_logo_size_error", "El logo no puede superar los 5 MB."));
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);
    setUploading(true);
    try {
      const response = await apiClient.post<{ logo_url: string }>(
        "/clubs/custom-logo",
        formData,
      );
      onChange({
        club_id: null,
        logo_url: response.data.logo_url,
        logo_source: "custom",
      });
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
          t("club_logo_upload_error", "No se pudo subir el logo."),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1.25} sx={{ flex: 1, width: "100%", minWidth: 0, maxWidth: "100%" }}>
      <Autocomplete<ClubOption, false, false, true>
        freeSolo
        options={options}
        value={null}
        inputValue={value.club}
        loading={searching}
        filterOptions={(items) => items}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        onInputChange={(_event, inputValue, reason) => {
          if (reason === "input" || reason === "clear") {
            handleTypedClub(inputValue);
          }
        }}
        onChange={(_event, selected) => handleSelection(selected)}
        noOptionsText={
          value.club.trim().length < 2
            ? t("club_search_min_chars", "Escribí al menos 2 letras")
            : t("club_not_found_manual", "No aparece: podés dejar el nombre manual")
        }
        renderOption={(props, option) => {
          const optionLogo = getSafeClubLogoUrl(option.logo_url);
          return (
            <Box component="li" {...props} key={option.id} sx={{ gap: 1.5, minWidth: 0 }}>
              <Avatar
                variant="rounded"
                src={optionLogo || undefined}
                alt=""
                sx={{ width: 36, height: 36, bgcolor: "grey.100" }}
              >
                {option.name.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {[option.country, option.league].filter(Boolean).join(" · ")}
                </Typography>
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("club_label", "Club")}
            helperText={t(
              "club_search_help",
              "Elegí un resultado o escribí el club manualmente si no aparece.",
            )}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {searching ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ xs: "stretch", sm: "center" }} flexWrap={{ sm: "wrap" }} useFlexGap sx={{ width: "100%", minWidth: 0 }}>
        {logoUrl && !imageFailed ? (
          <Avatar
            variant="rounded"
            src={logoUrl}
            alt={value.club ? `Escudo de ${value.club}` : "Escudo del club"}
            imgProps={{ onError: () => setImageFailed(true) }}
            sx={{ width: 52, height: 52, bgcolor: "grey.100", p: 0.5, alignSelf: { xs: "center", sm: "auto" } }}
          />
        ) : null}
        <Button component="label" variant="outlined" size="small" disabled={uploading} sx={{ width: { xs: "100%", sm: "auto" }, whiteSpace: "normal", textAlign: "center" }}>
          {uploading ? (
            <CircularProgress size={18} />
          ) : logoUrl ? (
            t("replace_club_logo", "Reemplazar logo")
          ) : (
            t("upload_club_logo", "Cargar logo opcional")
          )}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              void handleLogoUpload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </Button>
        {logoUrl ? (
          <Button
            type="button"
            size="small"
            color="inherit"
            sx={{ width: { xs: "100%", sm: "auto" } }}
            onClick={() =>
              onChange({ club_id: null, logo_url: "", logo_source: "" })
            }
          >
            {t("remove_club_logo", "Quitar logo")}
          </Button>
        ) : null}
      </Stack>
      {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
    </Stack>
  );
}
