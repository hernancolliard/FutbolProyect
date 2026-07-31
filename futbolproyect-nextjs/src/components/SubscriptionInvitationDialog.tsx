"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Dialog, DialogContent } from "@mui/material";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { hasCompatibleActiveSubscription } from "@/lib/subscriptionAccess";

const SUBSCRIPTION_PROMPT_KEY_PREFIX = "fp_subscription_prompt_shown_";

export default function SubscriptionInvitationDialog() {
  const { t } = useTranslation("common");
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isAdmin = Boolean(user?.isadmin || user?.isAdmin);
    const isSubscriptionFlow =
      pathname?.startsWith("/suscripcion") || pathname?.startsWith("/payment");

    if (
      loading ||
      !user ||
      isAdmin ||
      isSubscriptionFlow ||
      hasCompatibleActiveSubscription(user)
    ) {
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

    setOpen(true);
  }, [loading, pathname, user]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      aria-labelledby="subscription-invitation-title"
      PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden" } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#168a46]">
          <Sparkles size={27} aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#168a46]">
          {t("subscription_invitation_badge")}
        </p>
        <h2
          id="subscription-invitation-title"
          className="mt-2 text-2xl font-semibold text-[#071C3C]"
        >
          {t("subscription_invitation_title")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t("subscription_invitation_description")}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            component={Link}
            href="/suscripcion"
            variant="contained"
            onClick={() => setOpen(false)}
            sx={{
              borderRadius: "999px",
              py: 1.25,
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
              borderRadius: "999px",
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
            }}
          >
            {t("subscription_invitation_later")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
