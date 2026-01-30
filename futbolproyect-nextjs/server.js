const express = require("express");
const next = require("next");
const { parse } = require("url");

const port = parseInt(process.env.PORT, 10) || 10000;
const hostname = "localhost"; // Next.js interno prefiere localhost

// 🔒 Forzar producción
const dev = process.env.NODE_ENV !== "production";

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
    server.listen(port, "0.0.0.0", (err) => {
      if (err) throw err;
      console.log(`✅ Frontend listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  });
