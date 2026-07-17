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
import { useTranslation } from "react-i18next";

const statuses = [
  { value: "new", labelKey: "lead_status_new" },
  { value: "contacted", labelKey: "lead_status_contacted" },
  { value: "won", labelKey: "lead_status_won" },
  { value: "lost", labelKey: "lead_status_lost" },
  { value: "archived", labelKey: "lead_status_archived" },
];

export default function AdvertisingLeadManagement() {
  const { t, i18n } = useTranslation("common");
  const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-AR";
  const [leads, setLeads] = useState<AdvertisingLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/ads/admin/leads");
      setLeads(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("advertising_leads_load_error"));
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
      toast.success(t("status_updated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("update_error"));
    }
  };

  const handleDelete = async (lead: AdvertisingLead) => {
    if (!window.confirm(t("confirm_delete_advertising_lead", { name: lead.name }))) return;

    try {
      await apiClient.delete(`/ads/admin/leads/${lead.id}`);
      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      toast.success(t("advertising_lead_deleted"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("delete_error"));
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 4 }}>
        <CircularProgress sx={{ mr: 2 }} />
        {t("loading_advertising_leads")}
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
          <Typography variant="h5">{t("advertising_leads_title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("advertising_leads_subtitle")}
          </Typography>
        </div>
        <Chip label={t("advertising_leads_count", { count: leads.length })} />
      </Stack>

      <Table className="management-table">
        <TableHead>
          <TableRow>
            <TableCell>{t("date")}</TableCell>
            <TableCell>{t("contact")}</TableCell>
            <TableCell>{t("company")}</TableCell>
            <TableCell>{t("type")}</TableCell>
            <TableCell>{t("budget")}</TableCell>
            <TableCell>{t("message_label")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell>{t("actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                {lead.created_at ? new Date(lead.created_at).toLocaleDateString(dateLocale) : "-"}
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
                    {t("website")}
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
                      {t(status.labelKey)}
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
                  {t("delete_button")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography align="center" color="text.secondary">
                  {t("no_advertising_leads")}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
