"use client";

import { motion } from "framer-motion";
import { PlayCircle, Sparkles } from "lucide-react";

interface PlayerGalleryProps {
  imageUrl: string;
}

const galleryItems = [
  { title: "Entrenamiento", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80" },
  { title: "Partido", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80" },
  { title: "Sesión de fuerza", image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80" },
];

export function PlayerGallery({ imageUrl }: PlayerGalleryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
        <img src={imageUrl} alt="Foto principal del jugador" className="h-[320px] w-full rounded-[18px] object-cover" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {galleryItems.map((item) => (
          <div key={item.title} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
            <div className="relative h-40 overflow-hidden rounded-[18px]">
              <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                <button className="rounded-full bg-white/90 p-3 text-[#071C3C]">
                  <PlayCircle size={24} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="font-semibold text-[#071C3C]">{item.title}</p>
              <span className="rounded-full bg-[#071C3C]/5 px-2.5 py-1 text-xs text-slate-500">Lightbox</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
