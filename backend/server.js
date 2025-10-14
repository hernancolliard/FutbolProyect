const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config({ quiet: true });
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const db = require('./db');

const userRoutes = require("./routes/users.js");
const paymentRoutes = require("./routes/payments.js");
const offerRoutes = require("./routes/offers.js");
const applicationRoutes = require("./routes/applications.js");
const profileRoutes = require("./routes/profiles.js");
const adminRoutes = require("./routes/admin.js");
const termsRoutes = require("./routes/terms.js");
const privacyRoutes = require("./routes/privacy.js");
const contactRoutes = require("./routes/contact");
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

// Sitemap route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/offers', changefreq: 'daily', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      { url: '/subscribe', changefreq: 'monthly', priority: 0.7 },
      { url: '/terms', changefreq: 'yearly', priority: 0.3 },
      { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
    ];

    // Fetch active offers
    const offersData = await db.query("SELECT id FROM ofertas_laborales WHERE estado = 'abierta'");
    offersData.rows.forEach(offer => {
      links.push({ url: `/offers/${offer.id}`, changefreq: 'weekly', priority: 0.9 });
    });

    // Fetch users for profiles
    const usersData = await db.query('SELECT id FROM usuarios');
    usersData.rows.forEach(user => {
      links.push({ url: `/profile/${user.id}`, changefreq: 'monthly', priority: 0.6 });
    });

    const stream = new SitemapStream({ hostname: 'https://futbolproyect.com' });
    res.header('Content-Type', 'application/xml');

    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

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