"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock3, Goal, Shield, Sparkles, Target, Trophy, Zap } from "lucide-react";

const stats = [
  { label: "Partidos", value: "34", icon: BarChart3 },
  { label: "Minutos", value: "2.840", icon: Clock3 },
  { label: "Goles", value: "12", icon: Goal },
  { label: "Asistencias", value: "8", icon: Target },
  { label: "Tarjetas", value: "2", icon: Shield },
  { label: "Promedio Sofascore", value: "7.4", icon: Trophy },
  { label: "Pases", value: "1.240", icon: Sparkles },
  { label: "Recuperaciones", value: "98", icon: Zap },
];

export function PlayerStats() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#071C3C]">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-[#071C3C]/5 p-3 text-[#071C3C]">
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
