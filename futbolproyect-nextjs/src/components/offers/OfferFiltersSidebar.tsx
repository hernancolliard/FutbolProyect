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
            name="puesto"
            value={filters.puesto}
            onChange={handleText}
            placeholder="Buscar por puesto..."
            inputProps={{ "aria-label": "Buscar por puesto" }}
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
            <InputLabel>Ubicación</InputLabel>
            <Select
              name="ubicacion"
              value={filters.ubicacion}
              onChange={handleSelect}
              label="Ubicación"
            >
              <MenuItem value="">Todas</MenuItem>
              {ubicaciones.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Nivel</InputLabel>
            <Select
              name="nivel"
              value={filters.nivel}
              onChange={handleSelect}
              label="Nivel"
            >
              <MenuItem value="">Todos</MenuItem>
              {niveles.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Jornada</InputLabel>
            <Select
              name="horarios"
              value={filters.horarios}
              onChange={handleSelect}
              label="Jornada"
            >
              <MenuItem value="">Todas</MenuItem>
              {horarios.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" sx={{ color: "#40506a", fontWeight: 800 }}>
              Salario
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.8 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="salarioMin"
                value={filters.salarioMin}
                onChange={handleText}
                placeholder="Mín."
                inputProps={{ min: 0, "aria-label": "Salario mínimo" }}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                name="salarioMax"
                value={filters.salarioMax}
                onChange={handleText}
                placeholder="Máx."
                inputProps={{ min: 0, "aria-label": "Salario máximo" }}
                sx={fieldSx}
              />
            </Stack>
          </Box>

          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              name="sort"
              value={filters.sort}
              onChange={handleSelect}
              label="Ordenar por"
            >
              <MenuItem value="desc">Más recientes</MenuItem>
              <MenuItem value="asc">Más antiguas</MenuItem>
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
        <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,.76)" }}>
          Publicá tu oferta y conectá con profesionales del fútbol.
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
