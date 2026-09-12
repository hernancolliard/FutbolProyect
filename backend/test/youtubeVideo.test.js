const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getYouTubeVideoId,
  getYouTubeThumbnailUrl,
  isYouTubeThumbnailUrl,
} = require("../youtubeVideo");

test("extracts IDs from supported YouTube link formats", () => {
  const expectedId = "dQw4w9WgXcQ";
  const urls = [
    `https://www.youtube.com/watch?v=${expectedId}`,
    `https://youtu.be/${expectedId}?si=share-token`,
    `https://youtube.com/shorts/${expectedId}`,
    `https://www.youtube.com/live/${expectedId}?feature=share`,
    `https://www.youtube-nocookie.com/embed/${expectedId}`,
  ];

  urls.forEach((url) => assert.equal(getYouTubeVideoId(url), expectedId));
});

test("rejects non-YouTube and malformed links", () => {
  assert.equal(getYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(getYouTubeVideoId("youtube.com/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(getYouTubeVideoId("https://youtube.com/watch?v=too-short"), null);
});

test("builds the automatic YouTube thumbnail URL", () => {
  const thumbnailUrl = getYouTubeThumbnailUrl(
    "https://youtu.be/dQw4w9WgXcQ",
  );
  assert.equal(thumbnailUrl, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  assert.equal(isYouTubeThumbnailUrl(thumbnailUrl), true);
  assert.equal(
    isYouTubeThumbnailUrl("https://uploads.example.com/custom-cover.webp"),
    false,
  );
});
