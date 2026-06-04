"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { AdvertisingLead } from "@/lib/types";
import { toast } from "react-toastify";
import {
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const statuses = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "won", label: "Ganado" },
  { value: "lost", label: "Perdido" },
  { value: "archived", label: "Archivado" },
];

export default function AdvertisingLeadManagement() {
  const [leads, setLeads] = useState<AdvertisingLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/ads/admin/leads");
      setLeads(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar consultas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (lead: AdvertisingLead, status: string) => {
    try {
      const { data } = await apiClient.patch(`/ads/admin/leads/${lead.id}/status`, {
        status,
      });
      setLeads((prev) => prev.map((item) => (item.id === lead.id ? data : item)));
      toast.success("Estado actualizado.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo actualizar.");
    }
  };

  const handleDelete = async (lead: AdvertisingLead) => {
    if (!window.confirm(`Eliminar la consulta de ${lead.name}?`)) return;

    try {
      await apiClient.delete(`/ads/admin/leads/${lead.id}`);
      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      toast.success("Consulta eliminada.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No se pudo eliminar.");
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        Cargando consultas...
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ p: 2 }}
      >
        <div>
          <Typography variant="h5">Consultas de publicidad</Typography>
          <Typography variant="body2" color="text.secondary">
            Leads recibidos desde la pagina de anunciantes.
          </Typography>
        </div>
        <Chip label={`${leads.length} consultas`} />
      </Stack>

      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Contacto</TableCell>
            <TableCell>Empresa</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Presupuesto</TableCell>
            <TableCell>Mensaje</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-"}
              </TableCell>
              <TableCell>
                <Typography fontWeight={700}>{lead.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead.email}
                </Typography>
                {lead.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {lead.phone}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography>{lead.company || "-"}</Typography>
                {lead.website && (
                  <Typography
                    component="a"
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ color: "primary.main" }}
                  >
                    Sitio web
                  </Typography>
                )}
              </TableCell>
              <TableCell>{lead.advertiser_type || "-"}</TableCell>
              <TableCell>{lead.budget || "-"}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {lead.message}
                </Typography>
              </TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  value={lead.status}
                  onChange={(event) => handleStatusChange(lead, event.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(lead)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography align="center" color="text.secondary">
                  Todavia no hay consultas comerciales.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
