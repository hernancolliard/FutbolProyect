const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const next = require("next"); // Importante
const path = require("path");
require("dotenv").config({ quiet: true });

// --- Configuración de Next.js ---
// Define si estamos en desarrollo o producción
const dev = process.env.NODE_ENV !== "production";
// Apuntamos a la carpeta donde está Next.js (ajusta la ruta relativa si es necesario)
const dir = path.join(__dirname, "../futbolproyect-nextjs");
const appNext = next({ dev, dir });
const handle = appNext.getRequestHandler();

// Inicializamos Next.js antes que Express
appNext
  .prepare()
  .then(() => {
    const app = express();

    // --- Middlewares Generales ---
    app.use(
      cors({
        // En producción, usa la variable de entorno, sino permite todo o localhost
        origin: process.env.FRONTEND_URL || true,
        credentials: true,
      }),
    );
    app.use(express.json({ limit: "10mb" }));
    app.use(cookieParser());

    // --- RUTAS API (Tus rutas existentes) ---
    app.use("/api/users", require("./routes/users.js"));
    app.use("/api/payments", require("./routes/payments.js"));
    app.use("/api/offers", require("./routes/offers.js"));
    app.use("/api/applications", require("./routes/applications.js"));
    app.use("/api/profiles", require("./routes/profiles.js"));
    app.use("/api/admin", require("./routes/admin.js"));
    app.use("/api/terms", require("./routes/terms.js"));
    app.use("/api/privacy", require("./routes/privacy.js"));
    app.use("/api/contact", require("./routes/contact"));
    app.use("/api/sitemap", require("./routes/sitemap"));
    app.use("/api/subscriptions", require("./routes/subscriptions"));

    // Webhook raw body
    app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

    // --- MANEJO DE NEXT.JS (SEO y Vistas) ---
    // Cualquier petición que NO sea /api, la maneja Next.js
    app.all("*", (req, res) => {
      return handle(req, res);
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Servidor listo en el puerto ${PORT}`);
    });
  })
  .catch((ex) => {
    console.error("Error al iniciar Next.js", ex.stack);
    process.exit(1);
  });
