const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// COOP header para permitir Google OAuth popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

const corsOptions = {
  origin: [
    "https://futbolproyect.com",
    "https://www.futbolproyect.com",
    "https://futbolproyect.onrender.com",
    "http://localhost:3000",
    "http://localhost:10000",
    /\.vercel\.app$/,
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Anonymous-Voter-Id"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  optionsSuccessStatus: 200,
};

// Manejar CORS con preflight
app.use(cors(corsOptions));

// Middleware para manejar OPTIONS requests para todas las rutas
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Anonymous-Voter-Id'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).json({});
  }
  next();
});

// Middleware para parsear cookies
app.use(cookieParser());

// Middleware para parsear JSON con límite aumentado.
// Conserva el cuerpo original de PayPal para verificación/auditoría.
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith("/api/payments/webhook-paypal")) {
      req.rawBody = Buffer.from(buf);
    }
  },
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// RUTAS
app.use("/api/users", require("./routes/users"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/clubs", require("./routes/clubs"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin", require("./routes/adminAffiliates"));
app.use("/api/affiliates", require("./routes/affiliates"));
app.use("/api/affiliate", require("./routes/affiliates"));
app.use("/api/ads", require("./routes/ads"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/privacy", require("./routes/privacy"));
app.use("/api/terms", require("./routes/terms"));
app.use("/api/sitemap", require("./routes/sitemap"));
// etc...

const PORT = parseInt(process.env.PORT, 10) || 10000;
app.get("/", (req, res) => {
  res.status(200).send("API FutbolProyect OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend escuchando en puerto", PORT);
});
