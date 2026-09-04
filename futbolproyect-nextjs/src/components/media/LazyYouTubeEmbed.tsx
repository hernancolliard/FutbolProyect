"use client";

import { useState } from "react";
import Image from "next/image";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

const getYouTubeId = (url?: string | null) => {
  const match = String(url || "").match(
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  );
  return match?.[1]?.length === 11 ? match[1] : null;
};

type Props = {
  youtubeUrl: string;
  coverImageUrl?: string | null;
  title: string;
  sizes?: string;
};

export default function LazyYouTubeEmbed({
  youtubeUrl,
  coverImageUrl,
  title,
  sizes = "(max-width: 900px) 100vw, 760px",
}: Props) {
  const [isActivated, setIsActivated] = useState(false);
  const videoId = getYouTubeId(youtubeUrl);

  if (!videoId) return null;

  if (isActivated) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        width="800"
        height="450"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  const preview =
    coverImageUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <button
      type="button"
      onClick={() => setIsActivated(true)}
      aria-label={`Reproducir ${title}`}
      className="group absolute inset-0 h-full w-full overflow-hidden bg-[#071c3c]"
    >
      <Image
        src={preview}
        alt={`Miniatura de ${title}`}
        fill
        sizes={sizes}
        className="object-cover transition duration-300 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1262db] text-white shadow-xl transition group-hover:scale-105">
          <PlayArrowRoundedIcon sx={{ fontSize: 42 }} />
        </span>
      </span>
    </button>
  );
}
