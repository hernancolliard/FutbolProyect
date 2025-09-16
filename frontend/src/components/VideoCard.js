import React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const VideoCard = ({ video, onAdd, onPlay }) => {
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

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={() => onPlay(video)}>
        <CardMedia
          component="img"
          image={`http://localhost:5000/uploads/${video.cover_image_url}`}
          alt={video.title}
          sx={{ objectFit: "cover", maxHeight: 100 }} // Set max height to 100px and object-fit cover
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {video.title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoCard;
