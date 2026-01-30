const express = require("express");
const next = require("next");
const { parse } = require("url");

const port = process.env.PORT || 10000;
const hostname = "0.0.0.0";

// 🔒 Forzar producción
const dev = false;

const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.all("*", (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    // 🚨 NO pasar hostname acá
    server.listen(port, () => {
      console.log(`✅ Frontend listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  });
