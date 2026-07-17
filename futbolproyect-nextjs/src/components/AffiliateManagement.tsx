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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
  const [form, setForm] = useState(initial || emptyAffiliate);

  React.useEffect(() => setForm(initial || emptyAffiliate), [initial]);

  const change = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current: any) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{form.id ? t("edit_affiliate") : t("create_affiliate")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 1 }}>
          <TextField label={t("name_label")} value={form.name || ""} onChange={change("name")} required />
          <TextField label="Email" value={form.email || ""} onChange={change("email")} required />
          <TextField label={t("related_user_id")} value={form.user_id || ""} onChange={change("user_id")} />
          <TextField label={t("payout_email")} value={form.payout_email || ""} onChange={change("payout_email")} />
          <TextField label={t("code")} value={form.code || ""} onChange={change("code")} />
          <TextField label="Slug" value={form.slug || ""} onChange={change("slug")} />
          <TextField type="number" label={t("commission_percentage")} value={form.commission_rate} onChange={change("commission_rate")} />
          <TextField type="number" label={t("commission_months")} value={form.commission_months || ""} onChange={change("commission_months")} />
          <TextField type="number" label={t("cookie_days")} value={form.cookie_days} onChange={change("cookie_days")} />
          <TextField type="number" label={t("minimum_payout")} value={form.minimum_payout} onChange={change("minimum_payout")} />
          <TextField select label={t("status")} value={form.status || "ACTIVE"} onChange={change("status")}>
            <MenuItem value="ACTIVE">{t("active")}</MenuItem>
            <MenuItem value="PAUSED">{t("paused")}</MenuItem>
            <MenuItem value="BLOCKED">{t("blocked")}</MenuItem>
          </TextField>
          <TextField label={t("notes")} value={form.notes || ""} onChange={change("notes")} multiline minRows={2} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <Button variant="contained" onClick={() => onSubmit(form)}>{t("save")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AffiliateManagement() {
  const { t, i18n } = useTranslation("common");
  const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-AR";
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
      toast.success(t("affiliate_saved"));
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || t("save_error")),
  });

  const approveCommission = useMutation({
    mutationFn: async (id: number) => (await apiClient.post(`/admin/affiliate-commissions/${id}/approve`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAffiliateCommissions"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || t("approve_error")),
  });

  const createPayout = useMutation({
    mutationFn: async () =>
      (await apiClient.post("/admin/affiliate-payouts", {
        commissionIds: selectedCommissions,
        payment_method: "PAYPAL_MANUAL",
      })).data,
    onSuccess: () => {
      toast.success(t("payout_recorded"));
      setSelectedCommissions([]);
      queryClient.invalidateQueries({ queryKey: ["adminAffiliateCommissions"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliatePayouts"] });
      queryClient.invalidateQueries({ queryKey: ["adminAffiliates"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || t("payout_record_error")),
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
        <Tab label={t("affiliates")} value="affiliates" />
        <Tab label={t("commissions")} value="commissions" />
        <Tab label={t("payments")} value="payouts" />
      </Tabs>

      {tab === "affiliates" && (
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5">{t("affiliates")}</Typography>
            <Button variant="contained" onClick={() => { setEditing(null); setFormOpen(true); }}>
              {t("create_affiliate")}
            </Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("name_label")}</TableCell>
                  <TableCell>{t("code")}</TableCell>
                  <TableCell>{t("status")}</TableCell>
                  <TableCell>{t("commission")}</TableCell>
                  <TableCell>{t("clicks")}</TableCell>
                  <TableCell>{t("registrations")}</TableCell>
                  <TableCell>{t("revenue")}</TableCell>
                  <TableCell>{t("pending")}</TableCell>
                  <TableCell>{t("paid")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
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
                        <Button size="small" onClick={() => navigator.clipboard?.writeText(openLink(row.code))}>{t("copy")}</Button>
                        <Button size="small" onClick={() => { setEditing(row); setFormOpen(true); }}>{t("edit_button")}</Button>
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
            <Typography variant="h5">{t("commissions")}</Typography>
            <Button variant="contained" disabled={selectedCommissions.length === 0} onClick={() => createPayout.mutate()}>
              {t("record_manual_payout", { amount: money(selectedTotal) })}
            </Button>
          </Stack>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t("affiliate")}</TableCell>
                  <TableCell>{t("status")}</TableCell>
                  <TableCell>{t("transaction")}</TableCell>
                  <TableCell>{t("gross_amount")}</TableCell>
                  <TableCell>{t("commission")}</TableCell>
                  <TableCell>{t("available")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
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
                    <TableCell>{row.available_at ? new Date(row.available_at).toLocaleDateString(dateLocale) : "-"}</TableCell>
                    <TableCell>
                      <Button size="small" disabled={row.status !== "PENDING"} onClick={() => approveCommission.mutate(row.id)}>
                        {t("approve")}
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
                <TableCell>{t("affiliate")}</TableCell>
                <TableCell>{t("status")}</TableCell>
                <TableCell>{t("method")}</TableCell>
                <TableCell>{t("amount")}</TableCell>
                <TableCell>{t("date")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(payoutsQuery.data || []).map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.affiliate_name}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.payment_method}</TableCell>
                  <TableCell>{money(row.amount, row.currency)}</TableCell>
                  <TableCell>{row.paid_at ? new Date(row.paid_at).toLocaleDateString(dateLocale) : "-"}</TableCell>
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
