"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/apiClient";
import { Advertisement } from "@/lib/types";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface AdBannerProps {
  placement: string;
  limit?: number;
  compact?: boolean;
}

const getClickUrl = (id: number) => {
  const baseUrl = String(apiClient.defaults.baseURL || "").replace(/\/+$/, "");
  return `${baseUrl}/ads/${id}/click`;
};

export default function AdBanner({
  placement,
  limit = 1,
  compact = false,
}: AdBannerProps) {
  const { t, i18n } = useTranslation("common");
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const viewedAdsRef = useRef<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const language = useMemo(
    () => (i18n.language?.startsWith("en") ? "en" : "es"),
    [i18n.language],
  );

  useEffect(() => {
    let isMounted = true;

    const loadAds = async () => {
      try {
        const { data } = await apiClient.get("/ads", {
          params: { placement, language, limit },
        });
        if (isMounted) {
          setAds(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading ads:", error);
        }
      } finally {
        if (isMounted) {
          setHasLoaded(true);
        }
      }
    };

    loadAds();

    return () => {
      isMounted = false;
    };
  }, [placement, language, limit]);

  useEffect(() => {
    if (!ads.length || typeof window === "undefined") return;

    const elements = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>(
        `[data-ad-placement="${placement}"]`,
      ) || [],
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = Number((entry.target as HTMLElement).dataset.adId);
          if (!id || viewedAdsRef.current.has(id)) return;

          viewedAdsRef.current.add(id);
          apiClient.post(`/ads/${id}/impression`).catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.error("Error tracking ad impression:", error);
            }
          });
        });
      },
      { threshold: 0.45 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [ads, placement]);

  if (!ads.length) {
    return hasLoaded ? null : <Box sx={{ minHeight: compact ? 0 : 1 }} />;
  }

  return (
    <Stack
      ref={containerRef}
      spacing={2}
      sx={{
        width: "100%",
        my: compact ? 1.5 : 3,
      }}
    >
      {ads.map((ad) => (
        <Card
          key={ad.id}
          data-ad-id={ad.id}
          data-ad-placement={placement}
          variant="outlined"
          sx={{
            overflow: "hidden",
            borderColor: "rgba(25, 38, 52, 0.12)",
            bgcolor: "background.paper",
          }}
        >
          <CardActionArea
            component="a"
            href={getClickUrl(ad.id)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            sx={{
              display: "block",
              textAlign: "left",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: compact ? "column" : "row" }}
              spacing={0}
              sx={{
                minHeight: compact ? 120 : 150,
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: compact ? "100%" : 280 },
                  height: compact ? 130 : { xs: 160, sm: "auto" },
                  bgcolor: "#eef2f6",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={ad.image_url}
                  alt={ad.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>

              <Stack
                spacing={1}
                sx={{
                  p: compact ? 1.5 : 2,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  <Chip
                    size="small"
                    label={t("advertising_label", "Publicidad")}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {ad.advertiser_name}
                  </Typography>
                </Stack>

                <Typography
                  variant={compact ? "subtitle1" : "h6"}
                  sx={{ fontWeight: 800, lineHeight: 1.25 }}
                >
                  {ad.title}
                </Typography>

                {ad.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: compact ? 2 : 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {ad.description}
                  </Typography>
                )}

                <Box>
                  <Button
                    component="span"
                    size="small"
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    sx={{ mt: 0.5 }}
                  >
                    {ad.button_text || t("learn_more", "Ver mas")}
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}
