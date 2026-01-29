const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ quiet: true });

const app = express();

// CORS
app.use(
  cors({
    origin: "https://futbolproyect.com",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// LOG
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// RUTAS
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API escuchando en puerto ${PORT}`);
});
