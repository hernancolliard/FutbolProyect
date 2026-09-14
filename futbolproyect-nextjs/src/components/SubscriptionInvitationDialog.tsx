"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import { getCompletionRange, trackAnalyticsEvent } from "@/lib/analytics";
import { getProfileCompletion } from "@/lib/seoSlugs";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";

const SUBSCRIPTION_PROMPT_KEY_PREFIX = "fp_subscription_prompt_shown_";
const SUBSCRIPTION_PROMPT_MINIMUM_COMPLETION = 70;

export default function SubscriptionInvitationDialog() {
  const { t } = useTranslation("common");
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isAdmin = Boolean(user?.isadmin || user?.isAdmin);
    const isSubscriptionFlow =
      pathname?.startsWith("/suscripcion") || pathname?.startsWith("/payment");
    const isProfileFlow =
      pathname?.startsWith("/profile") || pathname?.startsWith("/perfiles");

    if (
      loading ||
      !user ||
      isAdmin ||
      isSubscriptionFlow ||
      isProfileFlow ||
      hasCompatibleActiveSubscription(user)
    ) {
      setOpen(false);
      return;
    }

    let cancelled = false;

    const openWhenProfileIsReady = async () => {
      try {
        const { data: profile } = await apiClient.get(`/profiles/${user.id}`);
        if (cancelled) return;
        const completionPercent = getProfileCompletion(profile);
        if (completionPercent < SUBSCRIPTION_PROMPT_MINIMUM_COMPLETION) {
          setOpen(false);
          return;
        }

        const storageKey = `${SUBSCRIPTION_PROMPT_KEY_PREFIX}${user.id}`;
        try {
          if (window.sessionStorage.getItem(storageKey)) return;
          window.sessionStorage.setItem(storageKey, "true");
        } catch {
          // El aviso sigue funcionando aunque el navegador bloquee sessionStorage.
        }

        if (!cancelled) {
          setOpen(true);
          trackAnalyticsEvent("subscription_prompt_viewed", {
            source_path: pathname || "/",
            profile_completion_range: getCompletionRange(completionPercent),
            account_type: user.tipo_usuario,
            user_role: user.rol,
          });
        }
      } catch {
        // Si no se puede comprobar el perfil, evitamos interrumpir al usuario.
        if (!cancelled) setOpen(false);
      }
    };

    openWhenProfileIsReady();

    return () => {
      cancelled = true;
    };
  }, [loading, pathname, user]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={14000}
      onClose={(_event, reason) => {
        if (reason !== "clickaway") setOpen(false);
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        left: { xs: 16, sm: "auto" },
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
      }}
    >
      <Paper
        role="status"
        aria-live="polite"
        elevation={8}
        sx={{
          width: { xs: "100%", sm: 410 },
          maxWidth: "100%",
          p: { xs: 2, sm: 2.5 },
          border: "1px solid #dbe5f1",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box
            aria-hidden="true"
            sx={{
              flex: "0 0 auto",
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "rgba(18, 98, 219, .1)",
              color: "#1262db",
            }}
          >
            <Sparkles size={21} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: "#1262db", fontWeight: 900, letterSpacing: ".08em" }}
            >
              {t("subscription_invitation_badge")}
            </Typography>
            <Typography
              id="subscription-invitation-title"
              component="h2"
              sx={{ mt: 0.3, color: "#071C3C", fontSize: "1.08rem", fontWeight: 900 }}
            >
              {t("subscription_invitation_title")}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.6, color: "#5d6b80", lineHeight: 1.5 }}>
              {t("subscription_invitation_description")}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            justifyContent: "flex-end",
          }}
        >
          <Button
            component={Link}
            href="/suscripcion"
            variant="contained"
            onClick={() => {
              trackAnalyticsEvent("subscription_plans_clicked", {
                source: "profile_activation_prompt",
                account_type: user?.tipo_usuario,
                user_role: user?.rol,
              });
              setOpen(false);
            }}
            sx={{
              order: { xs: 1, sm: 2 },
              borderRadius: 2,
              px: 2,
              fontWeight: 700,
              textTransform: "none",
              backgroundColor: "#071C3C",
              "&:hover": { backgroundColor: "#0b2c5f" },
            }}
          >
            {t("view_subscription_plans")}
          </Button>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            sx={{
              order: { xs: 2, sm: 1 },
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
            }}
          >
            {t("subscription_invitation_later")}
          </Button>
        </Box>
      </Paper>
    </Snackbar>
  );
}
