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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { useTranslation } from "react-i18next";

export type OfferFilters = {
  puesto: string;
  ubicacion: string;
  nivel: string;
  horarios: string;
  salarioMin: string;
  salarioMax: string;
  sort: string;
};

type Props = {
  filters: OfferFilters;
  ubicaciones: string[];
  niveles: string[];
  horarios: string[];
  onChange: (filters: OfferFilters) => void;
  onApply: () => void;
  onClear: () => void;
};

export default function OfferFiltersSidebar({
  filters,
  ubicaciones,
  niveles,
  horarios,
  onChange,
  onApply,
  onClear,
}: Props) {
  const { t } = useTranslation("common");
  const handleText = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSelect = (event: SelectChangeEvent<string>) => {
    onChange({ ...filters, [event.target.name]: event.target.value });
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fff",
      borderRadius: 1.5,
      fontSize: ".88rem",
    },
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
            name="puesto"
            value={filters.puesto}
            onChange={handleText}
            placeholder={t("filter_by_position")}
            inputProps={{ "aria-label": t("filter_by_position_aria") }}
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
            <InputLabel>{t("location_label")}</InputLabel>
            <Select
              name="ubicacion"
              value={filters.ubicacion}
              onChange={handleSelect}
              label={t("location_label")}
            >
              <MenuItem value="">{t("all_locations")}</MenuItem>
              {ubicaciones.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>{t("level")}</InputLabel>
            <Select
              name="nivel"
              value={filters.nivel}
              onChange={handleSelect}
              label={t("level")}
            >
              <MenuItem value="">{t("all_levels")}</MenuItem>
              {niveles.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>{t("schedule_label")}</InputLabel>
            <Select
              name="horarios"
              value={filters.horarios}
              onChange={handleSelect}
              label={t("schedule_label")}
            >
              <MenuItem value="">{t("all_schedules")}</MenuItem>
              {horarios.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" sx={{ color: "#40506a", fontWeight: 800 }}>
              {t("salary")}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.8 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="salarioMin"
                value={filters.salarioMin}
                onChange={handleText}
                placeholder={t("minimum_short")}
                inputProps={{ min: 0, "aria-label": t("minimum_salary") }}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                name="salarioMax"
                value={filters.salarioMax}
                onChange={handleText}
                placeholder={t("maximum_short")}
                inputProps={{ min: 0, "aria-label": t("maximum_salary") }}
                sx={fieldSx}
              />
            </Stack>
          </Box>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>{t("sort_by")}</InputLabel>
            <Select
              name="sort"
              value={filters.sort}
              onChange={handleSelect}
              label={t("sort_by")}
            >
              <MenuItem value="desc">{t("newest_first")}</MenuItem>
              <MenuItem value="asc">{t("oldest_first")}</MenuItem>
            </Select>
          </FormControl>

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
        <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,.76)" }}>
          {t("offers_sidebar_text")}
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
