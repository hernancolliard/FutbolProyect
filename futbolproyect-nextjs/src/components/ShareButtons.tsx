"use client";

import React, { useState } from "react";
import {
  FaDownload,
  FaEnvelope,
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
  FaWhatsapp,
} from "react-icons/fa";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";

type ShareButtonsProps = {
  title: string;
  url: string;
  onDownload?: () => void;
};

export default function ShareButtons({
  title,
  url,
  onDownload,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    {
      label: "Facebook",
      color: "#1877f2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebookF />,
    },
    {
      label: "LinkedIn",
      color: "#0a66c2",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: <FaLinkedinIn />,
    },
    {
      label: "WhatsApp",
      color: "#159a4b",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: <FaWhatsapp />,
    },
    {
      label: "Email",
      color: "#9b315f",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: <FaEnvelope />,
    },
  ];

  const iconSx = {
    width: 40,
    height: 40,
    border: "1px solid #dfe6ef",
    bgcolor: "#fff",
    "&:hover": { bgcolor: "#f2f6fb" },
  };

  return (
    <Box>
      <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
        {actions.map((action) => (
          <Tooltip title={action.label} key={action.label}>
            <IconButton
              component="a"
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Compartir en ${action.label}`}
              sx={{ ...iconSx, color: action.color }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Tooltip title={copied ? "Enlace copiado" : "Copiar enlace"}>
          <IconButton
            onClick={copyToClipboard}
            aria-label="Copiar enlace"
            sx={{ ...iconSx, color: "#40506a" }}
          >
            <FaLink />
          </IconButton>
        </Tooltip>
        {onDownload && (
          <Tooltip title="Descargar imagen">
            <IconButton
              onClick={onDownload}
              aria-label="Descargar imagen"
              sx={{ ...iconSx, color: "#40506a" }}
            >
              <FaDownload />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      {copied && (
        <Typography variant="caption" sx={{ mt: 1, color: "success.main", display: "block" }}>
          Enlace copiado
        </Typography>
      )}
    </Box>
  );
}
