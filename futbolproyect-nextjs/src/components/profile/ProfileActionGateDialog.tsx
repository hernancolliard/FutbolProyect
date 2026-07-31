"use client";

import Link from "next/link";
import { Button, Dialog, DialogContent } from "@mui/material";
import { LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileActionGateDialogProps {
  open: boolean;
  isRegistered: boolean;
  onClose: () => void;
}

export default function ProfileActionGateDialog({
  open,
  isRegistered,
  onClose,
}: ProfileActionGateDialogProps) {
  const { t } = useTranslation("common");
  const actionHref = isRegistered ? "/suscripcion" : "/register";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="profile-action-gate-title"
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#071C3C]/10 text-[#071C3C]">
          <LockKeyhole size={26} aria-hidden="true" />
        </div>
        <h2
          id="profile-action-gate-title"
          className="mt-5 text-2xl font-semibold text-[#071C3C]"
        >
          {t("profile_action_gate_title")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {t(
            isRegistered
              ? "profile_action_gate_subscription_description"
              : "profile_action_gate_guest_description",
          )}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            component={Link}
            href={actionHref}
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: "999px",
              py: 1.25,
              fontWeight: 700,
              textTransform: "none",
              backgroundColor: "#071C3C",
              "&:hover": { backgroundColor: "#0b2c5f" },
            }}
          >
            {t(
              isRegistered
                ? "view_subscription_plans"
                : "profile_action_gate_register",
            )}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            sx={{
              borderRadius: "999px",
              fontWeight: 600,
              textTransform: "none",
              color: "#475569",
            }}
          >
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
