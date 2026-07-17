"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function AffiliateRedirectPage() {
  const { t } = useTranslation("common");
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = params?.code;
    if (!code) return;

    const allowedUtm = new URLSearchParams();
    allowedUtm.set('ref', code);
    ["utm_source", "utm_medium", "utm_campaign"].forEach((key) => {
      const value = searchParams.get(key);
      if (value) allowedUtm.set(key, value);
    });

    const landingPath = `/register${allowedUtm.toString() ? `?${allowedUtm.toString()}` : ""}`;

    apiClient
      .post(`/affiliates/click/${encodeURIComponent(code)}`, { landingPath })
      .then((response) => router.replace(response.data?.redirectTo || landingPath))
      .catch(() => router.replace(landingPath));
  }, [params, router, searchParams]);

  return (
    <Box sx={{ minHeight: "50vh", display: "grid", placeItems: "center", gap: 2 }}>
      <CircularProgress />
      <Typography>{t("redirecting")}</Typography>
    </Box>
  );
}
