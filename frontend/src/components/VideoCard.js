import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import apiClient from "../services/api";

const VideoCard = ({ video, onAdd, onPlay, onEdit, isMyProfile }) => {
  if (!video) {
    return (
      <Card sx={{ height: "100%", display: "flex" }}>
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
            Añadir Video
          </Typography>
        </CardActionArea>
      </Card>
    );
  }

  const imageUrl = `${apiClient.defaults.baseURL}/uploads/${video.cover_image_url}`;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardActionArea onClick={() => onPlay(video)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={video.title}
          sx={{ objectFit: "cover", height: 120 }}
        />
        <CardContent sx={{ p: 1 }}>
          <Typography variant="subtitle1" component="div" noWrap>
            {video.title}
          </Typography>
        </CardContent>
      </CardActionArea>
      {isMyProfile && (
        <CardActions sx={{ p: 0, justifyContent: "flex-end" }}>
          <IconButton aria-label="edit" size="small" onClick={() => onEdit(video)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </CardActions>
      )}
    </Card>
  );
};

export default VideoCard;
