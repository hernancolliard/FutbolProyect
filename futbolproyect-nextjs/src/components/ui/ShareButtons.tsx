"use client";

import React, { useMemo, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";

interface ShareButtonsProps {
  title: string;
  url: string;
  requestRatings?: boolean;
}

const ShareButtons = ({
  title,
  url,
  requestRatings = false,
}: ShareButtonsProps) => {
  const [feedback, setFeedback] = useState("");
  const { t } = useTranslation();

  const absoluteUrl = useMemo(() => {
    if (url.startsWith("http")) return url;

    const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(
      /\/+$/,
      "",
    );
    if (configuredBaseUrl) {
      return `${configuredBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
    }

    if (typeof window !== "undefined") {
      return new URL(url || "/", window.location.origin).toString();
    }

    return url;
  }, [url]);

  const shareMessage = requestRatings
    ? t(
        "profile_rating_share_message",
        "Hola, este es mi perfil en FutbolProyect. Si conocés mi trayectoria como jugador, te invito a dejar una valoración honesta para ayudarme a ganar más visibilidad en la plataforma.",
      )
    : title;

  const fullShareText = `${shareMessage}\n\n${absoluteUrl}`;
  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedText = encodeURIComponent(fullShareText);

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
  };

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2500);
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      showFeedback(
        t(
          "profile_share_text_copied",
          "Texto y enlace copiados. Ya podés pegarlos donde quieras.",
        ),
      );
      return true;
    } catch (_error) {
      showFeedback(
        t("profile_share_copy_error", "No se pudo copiar el texto."),
      );
      return false;
    }
  };

  const handlePrimaryShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareMessage,
          url: absoluteUrl,
        });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }

    await copyShareText();
  };

  const handleInstagramShare = async () => {
    const copied = await copyShareText();
    if (copied && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = "instagram://app";
    }
  };

  const handleLinkedInClick = () => {
    void navigator.clipboard
      ?.writeText(fullShareText)
      .catch(() => undefined);
  };

  if (!requestRatings) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="subtitle2" component="h4" sx={{ mb: 0.5 }}>
          {t("share", "Compartir")}
        </Typography>
        <Stack direction="row" justifyContent="center" spacing={0.5}>
          <Tooltip title="Facebook">
            <IconButton
              component="a"
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("share_on_facebook", "Compartir en Facebook")}
            >
              <FaFacebook />
            </IconButton>
          </Tooltip>
          <Tooltip title="LinkedIn">
            <IconButton
              component="a"
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("share_on_linkedin", "Compartir en LinkedIn")}
            >
              <FaLinkedin />
            </IconButton>
          </Tooltip>
          <Tooltip title="WhatsApp">
            <IconButton
              component="a"
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("share_on_whatsapp", "Compartir en WhatsApp")}
            >
              <FaWhatsapp />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("copy_share_text", "Copiar texto y enlace")}>
            <IconButton
              onClick={copyShareText}
              aria-label={t("copy_share_text", "Copiar texto y enlace")}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {feedback && (
          <Typography
            role="status"
            variant="caption"
            color="success.main"
            sx={{ display: "block", mt: 0.5 }}
          >
            {feedback}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 420 }}>
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<ShareIcon />}
        onClick={handlePrimaryShare}
        sx={{
          py: 1.25,
          textTransform: "none",
          fontWeight: 800,
          lineHeight: 1.25,
        }}
      >
        {t(
          "share_profile_for_ratings",
          "Compartir mi perfil para recibir valoraciones",
        )}
      </Button>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={0.5}
        sx={{ mt: 1 }}
      >
        <Tooltip title="WhatsApp">
          <IconButton
            component="a"
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("share_on_whatsapp", "Compartir en WhatsApp")}
            sx={{ color: "#16883f" }}
          >
            <FaWhatsapp />
          </IconButton>
        </Tooltip>
        <Tooltip title="LinkedIn">
          <IconButton
            component="a"
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkedInClick}
            aria-label={t("share_on_linkedin", "Compartir en LinkedIn")}
            sx={{ color: "#0a66c2" }}
          >
            <FaLinkedin />
          </IconButton>
        </Tooltip>
        <Tooltip title="Facebook">
          <IconButton
            component="a"
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("share_on_facebook", "Compartir en Facebook")}
            sx={{ color: "#1877f2" }}
          >
            <FaFacebook />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={t(
            "copy_for_instagram",
            "Copiar texto para Instagram",
          )}
        >
          <IconButton
            onClick={handleInstagramShare}
            aria-label={t(
              "copy_for_instagram",
              "Copiar texto para Instagram",
            )}
            sx={{ color: "#c13584" }}
          >
            <FaInstagram />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("copy_share_text", "Copiar texto y enlace")}>
          <IconButton
            onClick={copyShareText}
            aria-label={t("copy_share_text", "Copiar texto y enlace")}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {feedback && (
        <Typography
          role="status"
          variant="caption"
          color="success.main"
          sx={{ display: "block", mt: 0.5, textAlign: "center" }}
        >
          {feedback}
        </Typography>
      )}
    </Box>
  );
};

export default ShareButtons;
