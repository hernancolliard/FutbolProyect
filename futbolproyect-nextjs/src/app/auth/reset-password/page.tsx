"use client";

export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  const { t } = useTranslation("common");
  return (
    <Suspense fallback={<p>{t("loading")}</p>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
