"use client";

import { motion } from "framer-motion";
import { Copy, Facebook, Link2, Mail, MessageCircle, Send, Twitter } from "lucide-react";

interface PlayerShareProps {
  link: string;
  onCopy: () => void;
}

export function PlayerShare({ link, onCopy }: PlayerShareProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <Link2 size={18} />
        <h3 className="text-xl font-semibold">Compartir perfil</h3>
      </div>
      <p className="mt-3 text-sm text-slate-500">Comparte este perfil con clubes, scouts y agencias.</p>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{link}</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={onCopy} className="inline-flex items-center gap-2 rounded-full bg-[#071C3C] px-4 py-2.5 font-semibold text-white"><Copy size={16} /> Copiar enlace</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><MessageCircle size={16} /> WhatsApp</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Facebook size={16} /> Facebook</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Twitter size={16} /> X</button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C]"><Mail size={16} /> Email</button>
      </div>
    </motion.div>
  );
}
