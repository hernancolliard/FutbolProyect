const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const normalizeHostname = (hostname) =>
  String(hostname || "")
    .toLowerCase()
    .replace(/^(?:www\.|m\.|music\.)/, "");

const isValidVideoId = (value) =>
  YOUTUBE_VIDEO_ID_PATTERN.test(String(value || ""));

const getYouTubeVideoId = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  let parsedUrl;
  try {
    parsedUrl = new URL(value.trim());
  } catch {
    return null;
  }

  const hostname = normalizeHostname(parsedUrl.hostname);
  let videoId = null;

  if (hostname === "youtu.be") {
    videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
  } else if (
    hostname === "youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    if (parsedUrl.pathname === "/watch") {
      videoId = parsedUrl.searchParams.get("v");
    } else {
      const [route, id] = parsedUrl.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live", "v"].includes(route)) {
        videoId = id;
      }
    }
  }

  return isValidVideoId(videoId) ? videoId : null;
};

const getYouTubeThumbnailUrl = (value) => {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
};

const isYouTubeThumbnailUrl = (value) =>
  typeof value === "string" &&
  /^https:\/\/i\.ytimg\.com\/vi\/[A-Za-z0-9_-]{11}\//.test(value);

module.exports = {
  getYouTubeVideoId,
  getYouTubeThumbnailUrl,
  isYouTubeThumbnailUrl,
};
