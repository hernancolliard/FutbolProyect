const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const userRoutes = require("./routes/users.js");
const paymentRoutes = require("./routes/payments.js");
const offerRoutes = require("./routes/offers.js");
const applicationRoutes = require("./routes/applications.js");
const profileRoutes = require("./routes/profiles.js");
const adminRoutes = require("./routes/admin.js");

const app = express();

// Middleware para el webhook de Stripe. Debe ir ANTES de express.json()
// porque Stripe envía el cuerpo de la petición en formato raw.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json({ limit: "50mb" })); // Permite al servidor entender JSON, con un límite de 10MB



// Servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static("uploads"));

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
