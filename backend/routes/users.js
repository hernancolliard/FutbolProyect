const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");
const db = require("../db");
const { verificarToken } = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../services/emailService");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   LOGIN NORMAL
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = @email",
      { email },
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const { password_hash, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   LOGIN CON GOOGLE
========================= */
router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let result = await db.query("SELECT * FROM usuarios WHERE email = @email", {
      email,
    });

    let user = result.rows[0];

    if (!user) {
      const created = await db.query(
        `INSERT INTO usuarios (nombre, email, foto_perfil, tipo_usuario)
         VALUES (@name, @email, @picture, 'postulante')
         RETURNING *`,
        { name, email, picture },
      );
      user = created.rows[0];
      await sendWelcomeEmail(user.email, user.nombre, user.tipo_usuario);
    }

    const jwtToken = jwt.sign(
      { id: user.id, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const { password_hash, ...userSafe } = user;
    res.json(userSafe);
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Error Google Login" });
  }
});

/* =========================
   USUARIO AUTENTICADO
========================= */
router.get("/me", verificarToken, async (req, res) => {
  const result = await db.query(
    "SELECT id, nombre, email, tipo_usuario, isadmin FROM usuarios WHERE id = @id",
    { id: req.user.id },
  );

  res.json(result.rows[0]);
});

/* =========================
   LOGOUT
========================= */
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout exitoso." });
});

module.exports = router;
