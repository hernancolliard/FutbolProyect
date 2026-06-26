"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

interface PlayerTimelineProps {
  timeline?: string | null;
}

interface TimelineRow {
  year: string;
  club: string;
  category: string;
  matches: string;
  goals: string;
}

const parseRows = (value?: string | null): TimelineRow[] =>
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
        category: parts[2] || "",
        matches: parts[3] || "",
        goals: parts[4] || "",
      };
    });

export function PlayerTimeline({ timeline }: PlayerTimelineProps) {
  const rows = parseRows(timeline);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <BadgeCheck size={18} />
        <h2 className="text-xl font-semibold uppercase">Trayectoria deportiva</h2>
      </div>

      {rows.length > 0 ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#071C3C]">
                <th className="px-2 py-3">A&ntilde;o</th>
                <th className="px-2 py-3">Club</th>
                <th className="px-2 py-3">Categoria</th>
                <th className="px-2 py-3 text-center">Partidos</th>
                <th className="px-2 py-3 text-center">Goles</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.year}-${row.club}-${index}`} className="border-b border-slate-100 text-slate-700 last:border-0">
                  <td className="px-2 py-3 font-medium text-[#071C3C]">{row.year}</td>
                  <td className="px-2 py-3">{row.club}</td>
                  <td className="px-2 py-3">{row.category}</td>
                  <td className="px-2 py-3 text-center">{row.matches}</td>
                  <td className="px-2 py-3 text-center">{row.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Aun no hay informacion de trayectoria cargada.</p>
      )}
    </motion.section>
  );
}
