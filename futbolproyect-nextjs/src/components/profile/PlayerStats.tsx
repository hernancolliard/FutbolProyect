"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export function PlayerStats() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#071C3C]">
        <BarChart3 size={18} />
        <h2 className="text-xl font-semibold">Estadísticas</h2>
      </div>
      <p className="mt-4 text-sm text-slate-500">Aún no hay estadísticas cargadas.</p>
    </motion.div>
  );
}
