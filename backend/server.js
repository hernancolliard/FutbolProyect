const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const next = require("next");
const path = require("path");
require("dotenv").config({ quiet: true });

const dev = process.env.NODE_ENV !== "production";
const dir = path.join(__dirname, "../futbolproyect-nextjs");

const appNext = next({ dev, dir });
const handle = appNext.getRequestHandler();

appNext.prepare().then(() => {
  const app = express();

  app.use(
    cors({
      origin: "https://futbolproyect.com",
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  // API routes
  app.use("/api/users", require("./routes/users"));
  app.use("/api/payments", require("./routes/payments"));
  app.use("/api/offers", require("./routes/offers"));
  app.use("/api/applications", require("./routes/applications"));
  app.use("/api/profiles", require("./routes/profiles"));
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/terms", require("./routes/terms"));
  app.use("/api/privacy", require("./routes/privacy"));
  app.use("/api/contact", require("./routes/contact"));
  app.use("/api/sitemap", require("./routes/sitemap"));
  app.use("/api/subscriptions", require("./routes/subscriptions"));

  // Next.js handler
  app.all(/(.*)/, (req, res) => handle(req, res));

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
  });
});
