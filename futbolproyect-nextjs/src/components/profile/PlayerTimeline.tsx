"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Building2, MapPin, Trophy } from "lucide-react";

const timeline = [
  { club: "FC Barcelona B", country: "España", category: "Primera RFEF", season: "2024/25", matches: "24", goals: "5", assists: "3" },
  { club: "UD Las Palmas", country: "España", category: "LaLiga Hypermotion", season: "2023/24", matches: "31", goals: "7", assists: "4" },
  { club: "Cultural Leonesa", country: "España", category: "Segunda División", season: "2022/23", matches: "28", goals: "6", assists: "2" },
];

export function PlayerTimeline() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {timeline.map((item, index) => (
        <div key={item.club} className="flex gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071C3C] text-white">
              <BadgeCheck size={18} />
            </div>
            {index < timeline.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-[#071C3C]">{item.club}</p>
                <p className="mt-1 text-sm text-slate-500">{item.category}</p>
              </div>
              <div className="rounded-full bg-[#071C3C]/5 px-3 py-1 text-sm font-medium text-[#071C3C]">{item.season}</div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} /> {item.country}</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Building2 size={16} /> {item.matches} partidos</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><Trophy size={16} /> {item.goals} goles · {item.assists} asistencias</div>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
