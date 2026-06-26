"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarDays, ListChecks, Target, Timer, Trophy } from "lucide-react";

interface PlayerStatsProps {
  stats?: string | null;
}

const icons = [CalendarDays, ListChecks, Timer, Trophy, Target];

const parseStructuredStats = (value?: string | null) => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    const season = String(parsed.temporada || "").trim();
    const seasonDetail = season ? `Temporada ${season}` : "";

    return [
      { value: season, label: "Temporada", detail: "" },
      { value: String(parsed.partidos || "").trim(), label: "Partidos", detail: seasonDetail },
      { value: String(parsed.minutos || "").trim(), label: "Minutos", detail: seasonDetail },
      { value: String(parsed.goles || "").trim(), label: "Goles", detail: seasonDetail },
      { value: String(parsed.asistencias || "").trim(), label: "Asistencias", detail: seasonDetail },
    ].filter((item) => item.value);
  } catch {
    return null;
  }
};

const parseStats = (value?: string | null) =>
  parseStructuredStats(value) ||
  (value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeParts = line.split("|").map((part) => part.trim());

      if (pipeParts.length >= 2) {
        return {
          value: pipeParts[0],
          label: pipeParts[1],
          detail: pipeParts.slice(2).join(" | "),
        };
      }

      const colonParts = line.split(":").map((part) => part.trim());
      if (colonParts.length >= 2) {
        return {
          value: colonParts.slice(1).join(":"),
          label: colonParts[0],
          detail: "",
        };
      }

      const [first, ...rest] = line.split(/\s+/);
      return {
        value: first || line,
        label: rest.join(" ") || "Temporada actual",
        detail: "",
      };
    });

export function PlayerStats({ stats }: PlayerStatsProps) {
  const items = parseStats(stats);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <BarChart3 size={18} />
        <h2 className="text-xl font-semibold uppercase">Estadisticas destacadas</h2>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length];

            return (
              <div key={`${item.value}-${item.label}-${index}`} className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
                <Icon size={34} strokeWidth={1.6} className="text-[#071C3C]" />
                <p className="mt-4 text-4xl font-extrabold leading-none text-[#071C3C]">{item.value}</p>
                <p className="mt-2 text-xs font-extrabold uppercase text-[#071C3C]">{item.label}</p>
                {item.detail ? <p className="mt-1 text-xs text-slate-500">{item.detail}</p> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Aun no hay estadisticas cargadas.</p>
      )}
    </motion.section>
  );
}
