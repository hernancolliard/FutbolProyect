"use client";

import { motion } from "framer-motion";
import { FileText, Film } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlayerDocumentsProps {
  cvUrl?: string;
}

export function PlayerDocuments({ cvUrl }: PlayerDocumentsProps) {
  const { t } = useTranslation("common");
  const normalizedCvUrl = (() => {
    const trimmed = String(cvUrl || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    return trimmed.startsWith("/") ? trimmed : `https://${trimmed}`;
  })();
  const hasCv = Boolean(normalizedCvUrl);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071C3C]/5 text-[#071C3C]">
          <FileText size={20} />
        </div>
        <p className="mt-4 font-semibold text-[#071C3C]">{t("sports_cv")}</p>
        <p className="mt-1 text-sm text-slate-500">{hasCv ? t("cv_document_uploaded") : t("profile_cv_missing")}</p>
        {hasCv ? (
          <a href={normalizedCvUrl} target="_blank" rel="noopener noreferrer" download className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">{t("open_cv")}</a>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071C3C]/5 text-[#071C3C]">
          <Film size={20} />
        </div>
        <p className="mt-4 font-semibold text-[#071C3C]">{t("videos")}</p>
        <p className="mt-1 text-sm text-slate-500">{t("profile_videos_tab_help")}</p>
      </div>
    </motion.div>
  );
}
