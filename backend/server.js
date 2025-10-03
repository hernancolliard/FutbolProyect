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

const app = express();

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
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Special case for Stripe webhook
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// --- STATIC ASSETS FIRST ---
// Serve static assets from the uploads folder
//app.use("/uploads", express.static("uploads"));
// Serve static assets from the React app build folder
app.use(express.static(path.join(__dirname, "../frontend/build")));

// --- API ROUTES ---
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
