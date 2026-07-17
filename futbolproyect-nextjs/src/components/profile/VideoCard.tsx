"use client";

import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box, // <--- ¡AQUÍ ESTABA EL FALTANTE!
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Video } from "@/lib/types";
import { useTranslation } from "react-i18next";

interface VideoCardProps {
  video: Video | null;
  onAdd: () => void;
  onPlay: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (videoId: number) => void;
  isMyProfile: boolean;
}

const VideoCard = ({
  video,
  onAdd,
  onPlay,
  onEdit,
  onDelete,
  isMyProfile,
}: VideoCardProps) => {
  const { t } = useTranslation("common");

  if (!video) {
    return (
      <Card sx={{ height: "100%", display: "flex", minHeight: 180 }}>
        <CardActionArea
          onClick={onAdd}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <AddCircleOutlineIcon
            sx={{ fontSize: 40, color: "text.secondary" }}
          />
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            {t("add_video")}
          </Typography>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 180,
      }}
    >
      <CardActionArea
        onClick={() => onPlay(video)}
        sx={{ flexGrow: 1, position: "relative" }}
      >
        <CardMedia
          component="img"
          image={video.cover_image_url}
          alt={video.title}
          sx={{ objectFit: "contain", height: 120 }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s",
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 50, color: "white" }} />
        </Box>
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle1" component="div" noWrap>
            {video.title}
          </Typography>
        </CardContent>
      </CardActionArea>
      {isMyProfile && (
        <CardActions sx={{ p: 0, justifyContent: "flex-end" }}>
          <IconButton
            aria-label={t("edit_button")}
            size="small"
            onClick={() => onEdit(video)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={t("delete_button")}
            size="small"
            onClick={() => onDelete(video.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      )}
    </Card>
  );
};

export default VideoCard;
