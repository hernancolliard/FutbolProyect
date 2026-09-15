"use client";

import Image from "next/image";
import { Box } from "@mui/material";

type ProfilePhotoProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  fallbackSrc?: string;
  fallbackPadding?: number;
};

export default function ProfilePhoto({
  src,
  alt,
  sizes,
  fallbackSrc = "/images/logos/logofpazul.webp",
  fallbackPadding = 42,
}: ProfilePhotoProps) {
  const hasPhoto = Boolean(src);
  const imageSrc = src || fallbackSrc;

  return (
    <>
      {hasPhoto ? (
        <Image
          src={imageSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          style={{
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(16px)",
            transform: "scale(1.14)",
            opacity: 0.46,
          }}
        />
      ) : null}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: hasPhoto ? "rgba(235, 240, 247, .3)" : "#eef3fa",
        }}
      />
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        style={{
          objectFit: "contain",
          objectPosition: "center",
          padding: hasPhoto ? 6 : fallbackPadding,
          opacity: hasPhoto ? 1 : 0.28,
        }}
      />
    </>
  );
}
