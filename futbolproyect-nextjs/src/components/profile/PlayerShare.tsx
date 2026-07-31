"use client";

import { motion } from "framer-motion";
import { Copy, Facebook, Link2, Mail, MessageCircle, Send, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlayerShareProps {
  link: string;
  onCopy: () => void;
  onShare: (url: string) => void;
}

export function PlayerShare({ link, onCopy, onShare }: PlayerShareProps) {
  const { t } = useTranslation("common");
  const encodedLink = encodeURIComponent(link);
  const encodedText = encodeURIComponent(t("share_profile_message", { link }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <Link2 size={18} />
        <h3 className="text-xl font-semibold">{t("share_profile")}</h3>
      </div>
      <p className="mt-3 text-sm text-slate-500">{t("share_profile_help")}</p>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{link}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full bg-[#071C3C] px-4 py-2.5 font-semibold text-white"><Copy size={16} /> {t("copy_link")}</button>
        <button onClick={() => onShare(`https://wa.me/?text=${encodedText}`)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><MessageCircle size={16} /> WhatsApp</button>
        <button onClick={() => onShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Facebook size={16} /> Facebook</button>
        <button onClick={() => onShare(`https://twitter.com/intent/tweet?text=${encodedText}`)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Twitter size={16} /> X</button>
        <button onClick={() => onShare(`mailto:?subject=${encodeURIComponent(t("profile_email_subject"))}&body=${encodedText}`)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Mail size={16} /> Email</button>
      </div>
    </motion.div>
  );
}
