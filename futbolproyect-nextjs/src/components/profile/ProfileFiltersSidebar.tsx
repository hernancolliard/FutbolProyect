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
            Filtros
          </Typography>
          <Button size="small" onClick={onClear} sx={{ minWidth: 0, px: 0.5 }}>
            Limpiar
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
            placeholder="Nombre o apellido..."
            inputProps={{ "aria-label": "Buscar por nombre" }}
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
            <InputLabel>Nacionalidad</InputLabel>
            <Select
              name="nacionalidad"
              value={filters.nacionalidad}
              onChange={handleSelect}
              label="Nacionalidad"
            >
              <MenuItem value="">Todas</MenuItem>
              {nacionalidades.map((nationality) => (
                <MenuItem key={nationality} value={nationality}>
                  {nationality}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Posición</InputLabel>
            <Select
              name="puesto"
              value={filters.puesto}
              onChange={handleSelect}
              label="Posición"
            >
              <MenuItem value="">Todas</MenuItem>
              {PLAYER_POSITION_OPTIONS.map((position) => (
                <MenuItem key={position.value} value={position.value}>
                  {position.fallback}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#40506a", fontWeight: 800 }}
            >
              Edad: {ageRange[0]}–{ageRange[1]} años
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
                No hay edades cargadas para filtrar.
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
            Aplicar filtros
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
          ¿Buscás talento para tu club?
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "rgba(255,255,255,.76)" }}
        >
          Explorá perfiles o publicá una oferta para llegar a más profesionales.
        </Typography>
        <Button
          component={Link}
          href="/create-offer"
          variant="contained"
          sx={{ mt: 2, bgcolor: "#1262db", fontWeight: 800 }}
        >
          Publicar oferta
        </Button>
      </Paper>
    </Stack>
  );
}
