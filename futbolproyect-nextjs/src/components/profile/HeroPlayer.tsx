"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CalendarDays, Copy, Download, Mail, MessageCircle, Ruler, Share2, Sparkles, Weight, Footprints, Globe2 } from "lucide-react";
import { Profile } from "@/lib/types";
import { useTranslation } from "react-i18next";

interface HeroPlayerProps {
  profile: Profile;
  age: number | null;
  birthDateLabel: string;
  nationalityLabel: string;
  availabilityLabel: string;
  availabilityTone: "positive" | "neutral";
  onCopyLink: () => void;
  onShare: () => void;
  onOpenLightbox: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  onDownloadCv: () => void;
  canEditProfile: boolean;
  onEditProfile: () => void;
  dominantFoot: string;
  positionLabel: string;
  languagesLabel: string;
}

const flagFor = (value?: string) => {
  const normalized = (value || "").toLowerCase();
  const map: Record<string, string> = {
    argentina: "🇦🇷",
    brasil: "🇧🇷",
    españa: "🇪🇸",
    spain: "🇪🇸",
    colombia: "🇨🇴",
    uruguay: "🇺🇾",
    mexico: "🇲🇽",
    chile: "🇨🇱",
    peru: "🇵🇪",
    paraguay: "🇵🇾",
    ecuador: "🇪🇨",
    venezuela: "🇻🇪",
    portugal: "🇵🇹",
    italy: "🇮🇹",
    france: "🇫🇷",
    germany: "🇩🇪",
    england: "🇬🇧",
    usa: "🇺🇸",
  };

  return map[normalized] || "🌍";
};

export function HeroPlayer({
  profile,
  age,
  nationalityLabel,
  availabilityLabel,
  availabilityTone,
  onCopyLink,
  onShare,
  onOpenLightbox,
  onWhatsApp,
  onEmail,
  onDownloadCv,
  canEditProfile,
  onEditProfile,
  dominantFoot,
  positionLabel,
  languagesLabel,
  birthDateLabel,
}: HeroPlayerProps) {
  const { t } = useTranslation("common");
  const heroImage = profile.foto_perfil_url || "/images/logos/logofp.png";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#071C3C] shadow-[0_24px_80px_rgba(7,28,60,0.16)]"
    >
      <div
        className="relative isolate flex flex-col overflow-hidden lg:flex-row"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(7,28,60,0.95) 0%, rgba(7,28,60,0.82) 40%, rgba(7,28,60,0.68) 100%), url('/images/estadio-futbol-1.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,211,102,0.15),transparent_40%)]" />
        <div className="relative flex-1 p-6 sm:p-8 lg:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100 backdrop-blur">
            <Sparkles size={16} className="text-[#25D366]" />
            {t("player_profile_badge")}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <button
                  onClick={onOpenLightbox}
                  className="group relative h-40 w-40 overflow-hidden rounded-[24px] border border-white/20 shadow-2xl sm:h-48 sm:w-48"
                  aria-label={t("open_player_photo")}
                >
                  <img src={heroImage} alt={`${profile.nombre} ${profile.apellido}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#071C3C]">{t("view_photo")}</span>
                  </div>
                </button>

                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-[#25D366]">
                    <BadgeCheck size={18} />
                    <span className="text-sm font-semibold uppercase tracking-[0.3em]">{availabilityLabel}</span>
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    {profile.nombre} {profile.apellido}
                  </h1>
                  <p className="mt-2 text-lg text-slate-200">{positionLabel || ""}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {positionLabel ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100">{positionLabel}</span> : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: t("age_plain"), value: age !== null ? t("age_years", { age }) : "" },
                  { label: t("birth_plain"), value: birthDateLabel || "" },
                  { label: t("height_plain"), value: profile.altura_cm ? `${profile.altura_cm} cm` : "" },
                  { label: t("weight_plain"), value: profile.peso_kg ? `${profile.peso_kg} kg` : "" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{item.label}</p>
                    <p className="mt-1 font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">{t("nationality_plain")}</p>
                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>{flagFor(nationalityLabel)}</span>
                    {nationalityLabel}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-medium ${availabilityTone === "positive" ? "bg-[#25D366]/20 text-[#25D366]" : "bg-white/10 text-slate-100"}`}>
                  {availabilityLabel}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2"><Footprints size={16} className="text-[#25D366]" /> {t("preferred_foot")}: {dominantFoot || ""}</div>
                <div className="flex items-center gap-2"><Globe2 size={16} className="text-[#25D366]" /> {t("languages")}: {languagesLabel || t("not_loaded")}</div>
                <div className="flex items-center gap-2"><CalendarDays size={16} className="text-[#25D366]" /> {birthDateLabel ? t("birthday_value", { date: birthDateLabel }) : t("birth_date_not_loaded")}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onShare} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-semibold text-[#071C3C] transition hover:-translate-y-0.5">
              <Share2 size={16} /> {t("share_profile")}
            </button>
            <button onClick={onCopyLink} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5">
              <Copy size={16} /> {t("copy_link")}
            </button>
            <button onClick={onWhatsApp} className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5">
              <MessageCircle size={16} /> WhatsApp
            </button>
            <button onClick={onEmail} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5">
              <Mail size={16} /> Email
            </button>
            <button onClick={onDownloadCv} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5">
              <Download size={16} /> {t("download_cv")}
            </button>
          </div>

          {canEditProfile && (
            <div className="mt-4">
              <button onClick={onEditProfile} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                {t("edit_profile")}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
