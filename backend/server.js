const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://futbolproyect.com", "https://www.futbolproyect.com"],
    credentials: true,
  }),
);

app.use(express.json());

// RUTAS
app.use("/api/users", require("./routes/users"));
app.use("/api/offers", require("./routes/offers"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/payments", require("./routes/payments"));
// etc...

const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
  res.status(200).send("API FutbolProyect OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend escuchando en puerto", PORT);
});
