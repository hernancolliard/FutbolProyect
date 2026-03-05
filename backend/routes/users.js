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
      sameSite: "none", // required for cross-site cookies (frontend on different domain)
      domain: process.env.COOKIE_DOMAIN || "futbolproyect.onrender.com",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const { password_hash, ...userSafe } = user;
    // return token as well so client can store it as fallback
    res.json({ user: userSafe, token });
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
         VALUES (@name, @email, @picture, 'ofertante')
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
      sameSite: "none",
      domain: process.env.COOKIE_DOMAIN || "futbolproyect.onrender.com",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const { password_hash, ...userSafe } = user;
    res.json({ user: userSafe, token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Error Google Login" });
  }
});

/* =========================
   USUARIO AUTENTICADO
========================= */
router.get("/me", verificarToken, async (req, res) => {
  try {
    // include subscription info
    const result = await db.query(
      `SELECT u.id, u.nombre, u.email, u.tipo_usuario, u.isadmin,
              s.plan as subscription_plan,
              s.estado as subscription_status,
              s.fecha_fin as subscription_end_date
       FROM usuarios u
       LEFT JOIN suscripciones s ON u.id = s.id_usuario
         AND s.estado = 'activa'
         AND s.fecha_fin > NOW()
       WHERE u.id = @id`,
      { id: req.user.id },
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ message: "Error al obtener datos del usuario." });
  }
});

/* =========================
   REGISTRO DE NUEVO USUARIO
========================= */
router.post("/register", async (req, res) => {
  const { nombre, email, password, tipo_usuario } = req.body;

  try {
    // Validación básica
    if (!email || !password || !nombre) {
      return res
        .status(400)
        .json({ message: "Email, nombre y contraseña son obligatorios." });
    }

    // Validación de tipo de usuario
    const tiposValidos = ["postulante", "ofertante"];
    if (!tiposValidos.includes(tipo_usuario)) {
      return res
        .status(400)
        .json({ message: "Tipo de usuario inválido." });
    }

    // Verificar si el email ya existe
    const existingUser = await db.query(
      "SELECT id FROM usuarios WHERE email = @email",
      { email }
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Este email ya está registrado." });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario
    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario)
       VALUES (@nombre, @email, @password_hash, @tipo_usuario)
       RETURNING id, nombre, email, tipo_usuario`,
      {
        nombre,
        email,
        password_hash,
        tipo_usuario,
      }
    );

    const newUser = result.rows[0];

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(newUser.email, newUser.nombre, newUser.tipo_usuario);
    } catch (emailErr) {
      console.error("Error al enviar email de bienvenida:", emailErr);
      // No bloquear el registro si el email falla
    }

    // Crear JWT automáticamente (auto-login)
    const token = jwt.sign(
      { id: newUser.id, tipo_usuario: newUser.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: process.env.COOKIE_DOMAIN || "futbolproyect.onrender.com",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Registro exitoso.",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   SOLICITUD DE RESTABLECIMIENTO DE CONTRASEÑA
========================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio." });
  }

  try {
    const result = await db.query("SELECT id, nombre FROM usuarios WHERE email = @email", { email });
    if (result.rows.length === 0) {
      // Responder igual para no revelar existencia
      return res.json({ message: "Si el correo existe, te enviamos un enlace para restablecer la contraseña." });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1h

    await db.query(
      `UPDATE usuarios SET reset_password_token = @token, reset_password_expires = @expires WHERE id = @id`,
      { token, expires, id: user.id }
    );

    const frontendUrl = process.env.FRONTEND_URL || "https://futbolproyect.com";
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, user.nombre, resetLink);
    } catch (emailErr) {
      console.error("Error enviando email de restablecimiento:", emailErr);
    }

    res.json({ message: "Si el correo existe, te enviamos un enlace para restablecer la contraseña." });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   CAMBIO DE CONTRASEÑA MEDIANTE TOKEN
========================= */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token y nueva contraseña son obligatorios." });
  }

  try {
    const query = `SELECT id FROM usuarios WHERE reset_password_token = @token AND reset_password_expires > NOW()`;
    const result = await db.query(query, { token });

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const userId = result.rows[0].id;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query(
      `UPDATE usuarios SET password_hash = @password_hash, reset_password_token = NULL, reset_password_expires = NULL WHERE id = @id`,
      { password_hash, id: userId }
    );

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("Error en reset-password:", err);
    res.status(500).json({ message: "Error del servidor." });
  }
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
