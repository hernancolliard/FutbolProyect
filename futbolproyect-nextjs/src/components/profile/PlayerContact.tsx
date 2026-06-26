"use client";

import { motion } from "framer-motion";
import { Globe2, Instagram, Linkedin, Mail, MessageCircle, Send } from "lucide-react";

interface PlayerContactProps {
  email?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  onWhatsApp: () => void;
  onEmail: () => void;
}

export function PlayerContact({ email, whatsappUrl, instagramUrl, linkedinUrl, websiteUrl, onWhatsApp, onEmail }: PlayerContactProps) {
  const normalizeExternalUrl = (url?: string) => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const links = [
    { label: "WhatsApp", href: whatsappUrl, icon: MessageCircle, accent: true },
    { label: "Email", href: email ? `mailto:${email}` : undefined, icon: Mail },
    { label: "Instagram", href: normalizeExternalUrl(instagramUrl), icon: Instagram },
    { label: "LinkedIn", href: normalizeExternalUrl(linkedinUrl), icon: Linkedin },
    { label: "Web", href: normalizeExternalUrl(websiteUrl), icon: Globe2 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Contacto</p>
          <h3 className="mt-1 text-xl font-semibold text-[#071C3C]">Conecta con el jugador</h3>
        </div>
        <button onClick={onWhatsApp} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 font-semibold text-white">
          <MessageCircle size={16} /> Contactar
        </button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon;
          if (item.label === "WhatsApp") {
            return (
              <button key={item.label} onClick={onWhatsApp} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${item.accent ? "border-[#25D366]/20 bg-[#25D366]/10 text-[#071C3C]" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <div className={`rounded-xl p-2 ${item.accent ? "bg-[#25D366] text-white" : "bg-white text-[#071C3C]"}`}>
                  <Icon size={16} />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          }

          if (item.label === "Email") {
            return (
              <button key={item.label} onClick={onEmail} disabled={!email} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${email ? "border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5" : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"}`}>
                <div className="rounded-xl bg-white p-2 text-[#071C3C]">
                  <Icon size={16} />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          }

          if (!item.href) {
            return (
              <div key={item.label} className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-slate-400">
                <div className="rounded-xl bg-white p-2 text-slate-400">
                  <Icon size={16} />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
            );
          }

          return (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${item.accent ? "border-[#25D366]/20 bg-[#25D366]/10 text-[#071C3C]" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
              <div className={`rounded-xl p-2 ${item.accent ? "bg-[#25D366] text-white" : "bg-white text-[#071C3C]"}`}>
                <Icon size={16} />
              </div>
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
      <button onClick={onEmail} className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#071C3C] transition hover:bg-slate-50">
        <Send size={16} /> Enviar email
      </button>
    </motion.div>
  );
}
