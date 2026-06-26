"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";

const reports = [
  { title: "Informe de rendimiento 2024", date: "12/04/2025", analyst: "Martín Pérez", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80" },
  { title: "Análisis táctico y posición", date: "05/03/2025", analyst: "Lucía Torres", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80" },
];

export function PlayerScouting() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-2">
      {reports.map((report) => (
        <div key={report.title} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <img src={report.image} alt={report.title} className="h-40 w-full object-cover" />
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={16} className="text-[#25D366]" /> Informe Scouting</div>
            <h3 className="mt-2 text-lg font-semibold text-[#071C3C]">{report.title}</h3>
            <p className="mt-2 text-sm text-slate-500">Fecha: {report.date} · Analista: {report.analyst}</p>
            <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#071C3C] px-4 py-2 text-sm font-semibold text-white">
              Ver informe completo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
