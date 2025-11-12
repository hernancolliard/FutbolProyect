const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({ quiet: true });

const userRoutes = require("./routes/users.js");
const paymentRoutes = require("./routes/payments.js");
const offerRoutes = require("./routes/offers.js");
const applicationRoutes = require("./routes/applications.js");
const profileRoutes = require("./routes/profiles.js");
const adminRoutes = require("./routes/admin.js");
const termsRoutes = require("./routes/terms.js");
const privacyRoutes = require("./routes/privacy.js");
const contactRoutes = require("./routes/contact");
const sitemapRoutes = require("./routes/sitemap");
const subscriptionRoutes = require("./routes/subscriptions");
const app = express();

// --- General Middleware ---
app.use(
  cors({
    origin: "https://futbolproyect.com",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --- API ROUTES (Deben ir primero) ---
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/sitemap", sitemapRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// --- PRERENDER.IO MIDDLEWARE ---
app.use(require('prerender-node').set('prerenderToken', process.env.PRERENDER_TOKEN));

// --- SERVIDOR DE ARCHIVOS ESTÁTICOS Y SPA HANDLER (Deben ir al final) ---
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});