"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useTranslation } from "react-i18next";
import VideoPlayerModal from "@/components/profile/VideoPlayerModal";
import publicApi from "@/lib/publicApi";
import type { FeaturedVideo } from "@/lib/types";
import { getYouTubeThumbnailUrl } from "@/lib/youtube";
import ProBadge from "@/components/ui/ProBadge";
import { trackAnalyticsEvent } from "@/lib/analytics";

type Props = {
  videos: FeaturedVideo[];
};

const getCoverUrl = (video: FeaturedVideo) => {
  if (video.cover_image_url) return video.cover_image_url;
  return getYouTubeThumbnailUrl(video.youtube_url) || "/images/logos/logofp.webp";
};

export default function FeaturedVideos({ videos }: Props) {
  const { t, i18n } = useTranslation("common");
  const railRef = useRef<HTMLDivElement | null>(null);
  const [displayedVideos, setDisplayedVideos] = useState(videos);
  const [isLoading, setIsLoading] = useState(videos.length === 0);
  const [selectedVideo, setSelectedVideo] = useState<FeaturedVideo | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const getVideoTitle = useCallback(
    (video: FeaturedVideo) =>
      (language === "en" ? video.title_en : video.title_es) || video.title,
    [language],
  );

  const updateArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 4);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      setDisplayedVideos(videos);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const refreshVideos = async () => {
      setIsLoading(true);
      try {
        const response = await publicApi.get<FeaturedVideo[]>(
          "/profiles/featured-videos?limit=12",
          { signal: controller.signal },
        );
        setDisplayedVideos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to refresh featured videos:", error);
          setDisplayedVideos([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    refreshVideos();
    return () => controller.abort();
  }, [videos]);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [displayedVideos.length, updateArrows]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.9, 280),
      behavior: "smooth",
    });
  };

  const selectedTitle = useMemo(
    () => (selectedVideo ? getVideoTitle(selectedVideo) : ""),
    [getVideoTitle, selectedVideo],
  );

  return (
    <Box
      component="section"
      aria-labelledby="featured-videos-title"
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        border: "1px solid rgba(194, 145, 18, .38)",
        borderRadius: 3,
        bgcolor: "#fffdf7",
        backgroundImage:
          "linear-gradient(135deg, rgba(255, 249, 223, .9) 0%, rgba(255, 255, 255, .96) 58%, rgba(255, 246, 210, .7) 100%)",
        boxShadow: "0 16px 38px rgba(112, 70, 0, .07)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        spacing={1}
        sx={{ mb: 2.25 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography
              id="featured-videos-title"
              component="h2"
              sx={{ color: "#0a1930", fontSize: { xs: "1.65rem", md: "2rem" }, fontWeight: 950 }}
            >
              {t("featured_videos_title", "Videos PRO destacados")}
            </Typography>
            <ProBadge />
          </Stack>
          <Typography sx={{ mt: 0.6, color: "#617086" }}>
            {t(
              "featured_videos_subtitle",
              "Jugadas, entrenamientos y presentaciones de miembros con suscripción activa.",
            )}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <IconButton
            aria-label={t("featured_videos_previous", "Videos anteriores")}
            onClick={() => scroll(-1)}
            disabled={!canGoBack}
            sx={{ border: "1px solid #d8e1ed", bgcolor: "#fff" }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton
            aria-label={t("featured_videos_next", "Más videos")}
            onClick={() => scroll(1)}
            disabled={!canGoForward}
            sx={{ border: "1px solid #d8e1ed", bgcolor: "#fff" }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {displayedVideos.length > 0 ? (
        <Box sx={{ position: "relative" }}>
          <Box
            ref={railRef}
            onScroll={updateArrows}
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              overscrollBehaviorInline: "contain",
              pb: 0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {displayedVideos.map((video) => {
            const title = getVideoTitle(video);
            const coverUrl = getCoverUrl(video);
            const fullName = `${video.nombre || ""} ${video.apellido || ""}`.trim();

            return (
              <Paper
                key={video.video_key}
                component="button"
                type="button"
                elevation={0}
                onClick={() => setSelectedVideo(video)}
                aria-label={t("featured_videos_play", {
                  title,
                  defaultValue: `Reproducir ${title}`,
                })}
                sx={{
                  flex: {
                    xs: "0 0 100%",
                    sm: "0 0 calc((100% - 16px) / 2)",
                    md: "0 0 calc((100% - 32px) / 3)",
                  },
                  minWidth: 0,
                  p: 0,
                  overflow: "hidden",
                  scrollSnapAlign: "start",
                  textAlign: "left",
                  border: "1px solid rgba(194, 145, 18, .42)",
                  borderRadius: 2.5,
                  bgcolor: "#fff",
                  cursor: "pointer",
                  font: "inherit",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 15px 32px rgba(112, 70, 0, .14)",
                  },
                  "&:focus-visible": {
                    outline: "3px solid rgba(194, 145, 18, .42)",
                    outlineOffset: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    bgcolor: "#071c3c",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={coverUrl}
                    alt={`Miniatura de ${title}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(rgba(3, 16, 38, .08), rgba(3, 16, 38, .32))",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        color: "#fff",
                        bgcolor: "rgba(154, 103, 0, .94)",
                        boxShadow: "0 8px 22px rgba(0, 0, 0, .28)",
                      }}
                    >
                      <PlayArrowRoundedIcon sx={{ fontSize: 38 }} />
                    </Box>
                  </Box>
                  <Box sx={{ position: "absolute", top: 10, left: 10 }}>
                    <ProBadge compact />
                  </Box>
                </Box>

                <Box sx={{ p: 2 }}>
                  <Typography
                    sx={{
                      color: "#0a1930",
                      fontWeight: 900,
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </Typography>
                  <Stack direction="row" spacing={1.1} alignItems="center" sx={{ mt: 1.4 }}>
                    <Avatar
                      src={video.foto_perfil_url || undefined}
                      alt={fullName}
                      sx={{ width: 34, height: 34 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#253a57", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {fullName}
                      </Typography>
                      {video.posicion_principal ? (
                        <Typography variant="caption" sx={{ color: "#718096" }}>
                          {video.posicion_principal}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            );
            })}
          </Box>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: "center",
            color: "#617086",
            border: "1px dashed #cbd6e4",
            borderRadius: 2.5,
            bgcolor: "rgba(255, 255, 255, .7)",
          }}
        >
          {isLoading
            ? t("featured_videos_loading", "Cargando videos...")
            : t(
                "featured_videos_empty",
                "Todavía no hay videos destacados disponibles.",
              )}
        </Paper>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mt: 2.2, pt: 2, borderTop: "1px solid rgba(194, 145, 18, .25)" }}
      >
        <Typography variant="body2" sx={{ color: "#76520d", fontWeight: 700 }}>
          {t("home_pro_videos_note")}
        </Typography>
        <Button
          component={Link}
          href="/suscripcion"
          variant="outlined"
          size="small"
          onClick={() =>
            trackAnalyticsEvent("subscription_plans_clicked", {
              source: "home_featured_videos",
            })
          }
          sx={{ color: "#805400", borderColor: "#c29112", fontWeight: 900 }}
        >
          {t("home_discover_pro")}
        </Button>
      </Stack>

      <VideoPlayerModal
        open={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
        youtubeUrl={selectedVideo?.youtube_url || null}
        title={selectedTitle}
      />
    </Box>
  );
}
