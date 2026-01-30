const express = require("express");
const next = require("next");
const { parse } = require("url");

const port = parseInt(process.env.PORT, 10) || 10000;
const hostname = "localhost"; // Next.js prefiere localhost internamente

// 🔒 Forzar producción
const dev = process.env.NODE_ENV !== "production";
console.log(
  `ℹ️ Iniciando servidor Frontend en modo: ${dev ? "Desarrollo" : "Producción"}`,
);

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

    // Endpoint de salud ligero para Render (Health Check)
    server.get("/healthz", (req, res) => {
      res.status(200).send("OK");
    });

    server.all("*", (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    // 🚨 NO pasar hostname acá
    server.listen(port, "0.0.0.0", (err) => {
      if (err) throw err;
      console.log(`✅ Frontend listening on port ${port} (0.0.0.0)`);
    });
  })
  .catch((err) => {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  });

// Manejo de errores globales para evitar caídas silenciosas
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});
