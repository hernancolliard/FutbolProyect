"use client";

import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("common");
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>404</h1>
      <p>{t("page_not_found")}</p>
    </div>
  );
}
