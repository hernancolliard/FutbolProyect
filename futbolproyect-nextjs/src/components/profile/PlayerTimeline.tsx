"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSafeClubLogoUrl } from "@/lib/clubCrests";

interface PlayerTimelineProps {
  timeline?: string | null;
}

interface TimelineRow {
  year: string;
  club: string;
  league: string;
  country: string;
  logo_url: string;
}

const parseStructuredRows = (value?: string | null): TimelineRow[] | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((row) => ({
        year: String(row.year || ""),
        club: String(row.club || ""),
        league: String(row.league || row.category || ""),
        country: String(row.country || ""),
        logo_url: String(row.logo_url || ""),
      }))
      .filter((row) => Object.values(row).some(Boolean));
  } catch {
    return null;
  }
};

const parseRows = (value?: string | null): TimelineRow[] =>
  parseStructuredRows(value) ||
  (value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("|")
        ? line.split("|").map((part) => part.trim())
        : line.split(" - ").map((part) => part.trim());

      return {
        year: parts[0] || "",
        club: parts[1] || line,
        league: parts[2] || "",
        country: parts[3] || "",
        logo_url: "",
      };
    });

export function PlayerTimeline({ timeline }: PlayerTimelineProps) {
  const { t } = useTranslation("common");
  const rows = parseRows(timeline);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <BadgeCheck size={18} />
        <h2 className="text-xl font-semibold uppercase">{t("sports_career")}</h2>
      </div>

      {rows.length > 0 ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#071C3C]">
                <th className="px-2 py-3">{t("year_label")}</th>
                <th className="px-2 py-3">{t("club_label")}</th>
                <th className="px-2 py-3">{t("league_label")}</th>
                <th className="px-2 py-3">{t("country_label")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.year}-${row.club}-${index}`} className="border-b border-slate-100 text-slate-700 last:border-0">
                  <td className="px-2 py-3 font-medium text-[#071C3C]">{row.year}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      {getSafeClubLogoUrl(row.logo_url) ? (
                        <img
                          src={getSafeClubLogoUrl(row.logo_url)}
                          alt={row.club ? `Escudo de ${row.club}` : "Escudo del club"}
                          width={40}
                          height={40}
                          loading="lazy"
                          className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 object-contain p-1"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <span>{row.club}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">{row.league}</td>
                  <td className="px-2 py-3">{row.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{t("no_career_uploaded")}</p>
      )}
    </motion.section>
  );
}
