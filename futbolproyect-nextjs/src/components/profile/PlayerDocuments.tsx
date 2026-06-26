"use client";

import { motion } from "framer-motion";
import { FileText, Film } from "lucide-react";

interface PlayerDocumentsProps {
  cvUrl?: string;
}

export function PlayerDocuments({ cvUrl }: PlayerDocumentsProps) {
  const hasCv = Boolean(cvUrl);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071C3C]/5 text-[#071C3C]">
          <FileText size={20} />
        </div>
        <p className="mt-4 font-semibold text-[#071C3C]">CV deportivo</p>
        <p className="mt-1 text-sm text-slate-500">{hasCv ? "Documento cargado por el usuario." : "No se cargó un CV aún."}</p>
        {hasCv ? (
          <a href={cvUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#071C3C]">Abrir CV</a>
        ) : null}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071C3C]/5 text-[#071C3C]">
          <Film size={20} />
        </div>
        <p className="mt-4 font-semibold text-[#071C3C]">Videos</p>
        <p className="mt-1 text-sm text-slate-500">Los videos se muestran en la pestaña correspondiente cuando el usuario los sube.</p>
      </div>
    </motion.div>
  );
}
