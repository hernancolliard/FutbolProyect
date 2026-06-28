"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { PLAYER_POSITION_OPTIONS } from "@/lib/profilePositions";
import { useTranslation } from "react-i18next";

export type ProfileFilters = {
  nombre: string;
  nacionalidad: string;
  puesto: string;
};

type Props = {
  filters: ProfileFilters;
  nacionalidades: string[];
  ageRange: [number, number];
  ageBounds: [number, number];
  hasAgeData: boolean;
  onChange: (filters: ProfileFilters) => void;
  onAgeChange: (range: [number, number]) => void;
  onApply: () => void;
  onClear: () => void;
};

export default function ProfileFiltersSidebar({
  filters,
  nacionalidades,
  ageRange,
  ageBounds,
  hasAgeData,
  onChange,
  onAgeChange,
  onApply,
  onClear,
}: Props) {
  const { t } = useTranslation("common");
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fff",
      borderRadius: 1.5,
      fontSize: ".88rem",
    },
  };

  const handleSelect = (event: SelectChangeEvent<string>) => {
    onChange({ ...filters, [event.target.name]: event.target.value });
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        component="aside"
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2.5,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2.25, py: 2 }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0a1930" }}>
            {t("filters")}
          </Typography>
          <Button size="small" onClick={onClear} sx={{ minWidth: 0, px: 0.5 }}>
            {t("clear_filters")}
          </Button>
        </Stack>
        <Divider />

        <Stack spacing={2.25} sx={{ p: 2.25 }}>
          <TextField
            fullWidth
            size="small"
            name="nombre"
            value={filters.nombre}
            onChange={(event) =>
              onChange({ ...filters, nombre: event.target.value })
            }
            placeholder={t("profile_name_search_placeholder")}
            inputProps={{ "aria-label": t("profile_name_search_aria") }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>{t("nationality_label")}</InputLabel>
            <Select
              name="nacionalidad"
              value={filters.nacionalidad}
              onChange={handleSelect}
              label={t("nationality_label")}
            >
              <MenuItem value="">{t("all_nationalities")}</MenuItem>
              {nacionalidades.map((nationality) => (
                <MenuItem key={nationality} value={nationality}>
                  {nationality}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>{t("position_label")}</InputLabel>
            <Select
              name="puesto"
              value={filters.puesto}
              onChange={handleSelect}
              label={t("position_label")}
            >
              <MenuItem value="">{t("all_positions")}</MenuItem>
              {PLAYER_POSITION_OPTIONS.map((position) => (
                <MenuItem key={position.value} value={position.value}>
                  {t(position.labelKey, position.fallback)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#40506a", fontWeight: 800 }}
            >
              {t("age_range", { min: ageRange[0], max: ageRange[1] })}
            </Typography>
            <Slider
              value={ageRange}
              onChange={(_event, value) => {
                if (Array.isArray(value)) {
                  onAgeChange([value[0], value[1]]);
                }
              }}
              min={ageBounds[0]}
              max={ageBounds[1]}
              disabled={!hasAgeData}
              disableSwap
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
            {!hasAgeData && (
              <Typography variant="caption" sx={{ color: "#7a8799" }}>
                {t("no_ages_to_filter")}
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={onApply}
            sx={{
              py: 1.15,
              bgcolor: "#1262db",
              fontWeight: 800,
              "&:hover": { bgcolor: "#0d4faf" },
            }}
          >
            {t("apply_filters")}
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          color: "#fff",
          background: "linear-gradient(145deg, #071a35, #0b3268)",
          boxShadow: "0 12px 28px rgba(4, 25, 55, .16)",
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
          {t("offers_sidebar_title")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "rgba(255,255,255,.76)" }}
        >
          {t("profiles_sidebar_text")}
        </Typography>
        <Button
          component={Link}
          href="/create-offer"
          variant="contained"
          sx={{ mt: 2, bgcolor: "#1262db", fontWeight: 800 }}
        >
          {t("publish_offer")}
        </Button>
      </Paper>
    </Stack>
  );
}
