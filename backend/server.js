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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Backend corriendo en puerto", PORT);
});
