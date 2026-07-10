"use client";

import React, { useMemo, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const emptyAffiliate = {
  name: "",
  email: "",
  user_id: "",
  code: "",
  slug: "",
  payout_email: "",
  commission_rate: 20,
  commission_months: 6,
  cookie_days: 60,
  minimum_payout: 20,
  status: "ACTIVE",
  notes: "",
};

const money = (value: any, currency = "USD") => `${currency} ${Number(value || 0).toFixed(2)}`;

function AffiliateForm({ open, initial, onClose, onSubmit }: any) {
  const [form, setForm] = useState(initial || emptyAffiliate);

  React.useEffect(() => setForm(initial || emptyAffiliate), [initial]);

  const change = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current: any) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{form.id ? "Editar afiliado" : "Crear afiliado"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 1 }}>
          <TextField label="Nombre" value={form.name || ""} onChange={change("name")} required />
          <TextField label="Email" value={form.email || ""} onChange={change("email")} required />
          <TextField label="Usuario relacionado ID" value={form.user_id || ""} onChange={change("user_id")} />
          <TextField label="Email de pago" value={form.payout_email || ""} onChange={change("payout_email")} />
          <TextField label="Codigo" value={form.code || ""} onChange={change("code")} />
          <TextField label="Slug" value={form.slug || ""} onChange={change("slug")} />
          <TextField type="number" label="% comision" value={form.commission_rate} onChange={change("commission_rate")} />
          <TextField type="number" label="Meses con comision" value={form.commission_months || ""} onChange={change("commission_months")} />
          <TextField type="number" label="Dias de cookie" value={form.cookie_days} onChange={change("cookie_days")} />
          <TextField type="number" label="Pago minimo" value={form.minimum_payout} onChange={change("minimum_payout")} />
          <TextField select label="Estado" value={form.status || "ACTIVE"} onChange={change("status")}>
            <MenuItem value="ACTIVE">Activo</MenuItem>
            <MenuItem value="PAUSED">Pausado</MenuItem>
            <MenuItem value="BLOCKED">Bloqueado</MenuItem>
          </TextField>
          <TextField label="Notas" value={form.notes || ""} onChange={change("notes")} multiline minRows={2} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onSubmit(form)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AffiliateManagement() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("affiliates");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);

  const affiliatesQuery = useQuery({
    queryKey: ["adminAffiliates"],
    queryFn: async () => (await apiClient.get("/admin/affiliates")).data,
  });
  const commissionsQuery = useQuery({
    queryKey: ["adminAffiliateCommissions"],
    queryFn: async () => (await apiClient.get("/admin/affiliate-commissions")).data,
  });
  const payoutsQuery = useQuery({
    queryKey: ["adminAffiliatePayouts"],
    queryFn: async () => (await apiClient.get("/admin/affiliate-payouts")).data,
  });

  const saveAffiliate = useMutation({
    mutationFn: async (payload: any) => {
      const body = { ...payload, user_id: payload.user_id || null };
      if (payload.id) return (await apiClient.patch(`/admin/affiliates/${payload.id}`, body)).data;
      return (await apiClient.post("/admin/affiliates", body)).data;
    },
    onSuccess: () => {
      toast.success("Afiliado guardado.");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "No se pudo guardar."),
  });

  const approveCommission = useMutation({
    mutationFn: async (id: number) => (await apiClient.post(`/admin/affiliate-commissions/${id}/approve`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAffiliateCommissions"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "No se pudo aprobar."),
  });

  const createPayout = useMutation({
    mutationFn: async () =>
      (await apiClient.post("/admin/affiliate-payouts", {
        commissionIds: selectedCommissions,
        payment_method: "PAYPAL_MANUAL",
      })).data,
    onSuccess: () => {
      toast.success("Pago registrado.");
      setSelectedCommissions([]);
      queryClient.invalidateQueries({ queryKey: ["adminAffiliateCommissions"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliatePayouts"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "No se pudo registrar el pago."),
  });

  const selectedTotal = useMemo(() => {
    const rows = commissionsQuery.data || [];
    return rows
      .filter((row: any) => selectedCommissions.includes(row.id))
      .reduce((sum: number, row: any) => sum + Number(row.commission_amount || 0), 0);
  }, [commissionsQuery.data, selectedCommissions]);

  const openLink = (code: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/r/${code}` : `/r/${code}`;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Afiliados" value="affiliates" />
        <Tab label="Comisiones" value="commissions" />
        <Tab label="Pagos" value="payouts" />
      </Tabs>

      {tab === "affiliates" && (
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5">Afiliados</Typography>
            <Button variant="contained" onClick={() => { setEditing(null); setFormOpen(true); }}>
              Crear afiliado
            </Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Codigo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Comision</TableCell>
                  <TableCell>Clics</TableCell>
                  <TableCell>Registros</TableCell>
                  <TableCell>Ingresos</TableCell>
                  <TableCell>Pendiente</TableCell>
                  <TableCell>Pagado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(affiliatesQuery.data || []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}<br /><Typography variant="caption">{row.email}</Typography></TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.commission_rate}%</TableCell>
                    <TableCell>{row.total_clicks}</TableCell>
                    <TableCell>{row.registrations}</TableCell>
                    <TableCell>{money(row.gross_revenue)}</TableCell>
                    <TableCell>{money(row.pending_commission)}</TableCell>
                    <TableCell>{money(row.paid_commission)}</TableCell>
                    <TableCell>
                      <Stack direction="row" gap={1}>
                        <Button size="small" onClick={() => navigator.clipboard?.writeText(openLink(row.code))}>Copiar</Button>
                        <Button size="small" onClick={() => { setEditing(row); setFormOpen(true); }}>Editar</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === "commissions" && (
        <Box>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
            <Typography variant="h5">Comisiones</Typography>
            <Button variant="contained" disabled={selectedCommissions.length === 0} onClick={() => createPayout.mutate()}>
              Registrar pago manual ({money(selectedTotal)})
            </Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Afiliado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Transaccion</TableCell>
                  <TableCell>Bruto</TableCell>
                  <TableCell>Comision</TableCell>
                  <TableCell>Disponible</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(commissionsQuery.data || []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCommissions.includes(row.id)}
                        disabled={row.status !== "APPROVED"}
                        onChange={(event) => {
                          setSelectedCommissions((current) =>
                            event.target.checked
                              ? [...current, row.id]
                              : current.filter((id) => id !== row.id),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.affiliate_name}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{String(row.paypal_transaction_id || "").slice(0, 12)}</TableCell>
                    <TableCell>{money(row.gross_amount, row.currency)}</TableCell>
                    <TableCell>{money(row.commission_amount, row.currency)}</TableCell>
                    <TableCell>{row.available_at ? new Date(row.available_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <Button size="small" disabled={row.status !== "PENDING"} onClick={() => approveCommission.mutate(row.id)}>
                        Aprobar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === "payouts" && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Afiliado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Metodo</TableCell>
                <TableCell>Importe</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(payoutsQuery.data || []).map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.affiliate_name}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.payment_method}</TableCell>
                  <TableCell>{money(row.amount, row.currency)}</TableCell>
                  <TableCell>{row.paid_at ? new Date(row.paid_at).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AffiliateForm
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload: any) => saveAffiliate.mutate(payload)}
      />
    </Box>
  );
}
