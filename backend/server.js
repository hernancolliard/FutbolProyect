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
const app = express();

// --- STATIC ASSETS FIRST ---
// Sirve los archivos estáticos de la aplicación de React construida.
// Esto debe ir primero para que las peticiones de CSS, JS, imágenes y el index.html
// se manejen de forma rápida y eficiente, sin pasar por middlewares de API.
app.use(express.static(path.join(__dirname, "../frontend/build")));

// General Middleware
const whitelist = [
  "http://localhost:3000",
  "https://futbolproyect.com",
  "https://www.futbolproyect.com",
  "https://futbolproyect.onrender.com",
];
const corsOptions = {
  origin: whitelist,
  credentials: true,
};

// ... (otro código) ...

// REEMPLAZA tu app.use(cors()) con esto:
app.use(
  cors({
    origin: "https://futbolproyect.com", // La URL de tu frontend
    credentials: true, // ¡Esta es la línea clave!
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --- API ROUTES ---
// Special case for Stripe webhook (debe ir antes de express.json si no se usa en el resto de la api)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/privacy", privacyRoutes);

// --- SPA CATCHALL HANDLER ---
// For any request that doesn't match one of the above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
