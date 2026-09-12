const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const getYouTubeVideoId = (value: string | null | undefined) => {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    const hostname = url.hostname
      .toLowerCase()
      .replace(/^(?:www\.|m\.|music\.)/, "");
    let videoId: string | null | undefined = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0];
    } else if (
      hostname === "youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [route, id] = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live", "v"].includes(route)) videoId = id;
      }
    }

    return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
};

export const getYouTubeThumbnailUrl = (
  value: string | null | undefined,
) => {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
};
