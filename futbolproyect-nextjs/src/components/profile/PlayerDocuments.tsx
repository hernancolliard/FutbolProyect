"use client";

import { motion } from "framer-motion";
import { FileDown, FileText, Film, ShieldCheck } from "lucide-react";

const documents = [
  { title: "CV Deportivo", type: "PDF", icon: FileText },
  { title: "Informe Scout", type: "PDF", icon: ShieldCheck },
  { title: "Video CV", type: "MP4", icon: Film },
  { title: "Certificados", type: "ZIP", icon: FileDown },
];

export function PlayerDocuments() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {documents.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071C3C]/5 text-[#071C3C]">
              <Icon size={20} />
            </div>
            <p className="mt-4 font-semibold text-[#071C3C]">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.type}</p>
            <button className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">Descargar</button>
          </div>
        );
      })}
    </motion.div>
  );
}
