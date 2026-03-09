const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// COOP header para permitir Google OAuth popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(
  cors({
    origin: [
      "https://futbolproyect.com",
      "https://www.futbolproyect.com",
      "https://futbolproyect.onrender.com",
      "http://localhost:3000",
      "http://localhost:10000",
      /\.vercel\.app$/,
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// RUTAS
app.use("/api/users", require("./routes/users"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/admin", require("./routes/admin"));
// etc...

const PORT = parseInt(process.env.PORT, 10) || 10000;
app.get("/", (req, res) => {
  res.status(200).send("API FutbolProyect OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend escuchando en puerto", PORT);
});
