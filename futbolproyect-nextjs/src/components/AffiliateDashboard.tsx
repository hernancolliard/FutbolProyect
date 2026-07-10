"use client";

import React from "react";
import apiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const money = (value: any, currency = "USD") =>
  `${currency} ${Number(value || 0).toFixed(2)}`;

export default function AffiliateDashboard() {
  const statsQuery = useQuery({
    queryKey: ["affiliateMeStats"],
    queryFn: async () => (await apiClient.get("/affiliate/me/stats")).data,
  });
  const commissionsQuery = useQuery({
    queryKey: ["affiliateMeCommissions"],
    queryFn: async () => (await apiClient.get("/affiliate/me/commissions")).data,
  });
  const payoutsQuery = useQuery({
    queryKey: ["affiliateMePayouts"],
    queryFn: async () => (await apiClient.get("/affiliate/me/payouts")).data,
  });

  if (statsQuery.isLoading) {
    return <CircularProgress />;
  }

  if (statsQuery.isError) {
    return <Alert severity="info">No hay una cuenta de afiliado asociada a tu usuario.</Alert>;
  }

  const stats = statsQuery.data;
  const referralLink =
    typeof window !== "undefined" ? `${window.location.origin}/r/${stats.code}` : `/r/${stats.code}`;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Panel de afiliado</Typography>
          <Typography sx={{ color: "#64748b" }}>{stats.name} · {stats.code}</Typography>
        </Box>
        <Button variant="contained" onClick={() => navigator.clipboard?.writeText(referralLink)}>
          Copiar enlace
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2, mt: 3 }}>
        {[
          ["Clics", stats.total_clicks],
          ["Registros", stats.registrations],
          ["Suscriptores", stats.paying_subscribers],
          ["Ingresos", money(stats.gross_revenue)],
          ["Pendiente", money(stats.pending_commission)],
          ["Disponible", money(stats.available_commission)],
          ["Aprobado", money(stats.approved_commission)],
          ["Cobrado", money(stats.paid_commission)],
        ].map(([label, value]) => (
          <Paper key={label} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#64748b" }}>{label}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{value}</Typography>
          </Paper>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 900 }}>Comisiones</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Importe</TableCell>
              <TableCell>Disponible</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(commissionsQuery.data || []).map((row: any, index: number) => (
              <TableRow key={`${row.created_at}-${index}`}>
                <TableCell>{row.referred_label}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{money(row.commission_amount, row.currency)}</TableCell>
                <TableCell>{row.available_at ? new Date(row.available_at).toLocaleDateString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: 900 }}>Pagos</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Metodo</TableCell>
              <TableCell>Importe</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(payoutsQuery.data || []).map((row: any, index: number) => (
              <TableRow key={`${row.created_at}-${index}`}>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.payment_method}</TableCell>
                <TableCell>{money(row.amount, row.currency)}</TableCell>
                <TableCell>{row.paid_at ? new Date(row.paid_at).toLocaleDateString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
