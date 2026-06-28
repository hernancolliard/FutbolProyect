"use client";

import { motion } from "framer-motion";
import { Copy, Download, MessageCircle, Share2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlayerSidebarProps {
  imageUrl: string;
  name: string;
  availabilityLabel: string;
  onCopyLink: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  onDownloadCv: () => void;
}

export function PlayerSidebar({ imageUrl, name, availabilityLabel, onCopyLink, onShare, onWhatsApp, onDownloadCv }: PlayerSidebarProps) {
  const { t } = useTranslation("common");
  return (
    <motion.aside initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden shrink-0 lg:block lg:sticky lg:top-6 lg:self-start">
      <div className="w-full max-w-[320px] rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-[22px] bg-slate-100">
          <img src={imageUrl} alt={name} className="max-h-full max-w-full object-contain" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-full bg-[#071C3C]/5 px-3 py-2 text-sm font-medium text-[#071C3C]">
          <Sparkles size={15} className="text-[#25D366]" /> {availabilityLabel}
        </div>
        <div className="mt-5 space-y-2">
          <button onClick={onWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5">
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={onShare} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-[#071C3C] transition hover:bg-slate-100">
            <Share2 size={16} /> {t("share_profile")}
          </button>
          <button onClick={onCopyLink} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-[#071C3C] transition hover:bg-slate-100">
            <Copy size={16} /> {t("copy_link")}
          </button>
          <button onClick={onDownloadCv} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-[#071C3C] transition hover:bg-slate-100">
            <Download size={16} /> {t("download_cv")}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
