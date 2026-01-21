const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");
const db = require("../db");
const validate = require("../middleware/validateMiddleware");
const { verificarToken } = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../services/emailService");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   REGISTRO
========================= */

const registerSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  tipo_usuario: z.enum(["postulante", "ofertante", "agencia"]),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  dni: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional(),
});

router.post("/register", validate(registerSchema), async (req, res) => {
  const {
    nombre,
    email,
    password,
    tipo_usuario,
    apellido,
    telefono,
    dni,
    direccion,
    ciudad,
    pais,
  } = req.body;

  try {
    const userExists = await db.query(
      "SELECT id FROM usuarios WHERE email = @email",
      { email },
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "El correo ya está en uso." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO usuarios
       (nombre, apellido, telefono, email, password_hash, dni, direccion, ciudad, pais, tipo_usuario)
       VALUES
       (@nombre, @apellido, @telefono, @email, @password_hash, @dni, @direccion, @ciudad, @pais, @tipo_usuario)
       RETURNING id, nombre, email, tipo_usuario, isadmin`,
      {
        nombre,
        apellido: apellido || null,
        telefono: telefono || null,
        email,
        password_hash,
        dni: dni || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        pais: pais || null,
        tipo_usuario,
      },
    );

    const user = result.rows[0];

    await sendWelcomeEmail(user.email, user.nombre, user.tipo_usuario);

    res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   LOGIN
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

    const payload = {
      id: user.id,
      tipo_usuario: user.tipo_usuario,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ⚠️ CORRECCIÓN: sameSite NONE para que funcione con frontend separado
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    const { password_hash, ...userSafe } = user;

    // ⚠️ CORRECCIÓN: DEVOLVEMOS token también
    res.json({ user: userSafe, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   USUARIO AUTENTICADO
========================= */

router.get("/me", verificarToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, nombre, email, tipo_usuario, isadmin FROM usuarios WHERE id = @id",
      { id: req.user.id },
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   FORGOT PASSWORD (PÚBLICO)
========================= */

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query(
      "SELECT id, email, nombre FROM usuarios WHERE email = @email",
      { email },
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(200).json({
        message:
          "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      `UPDATE usuarios
       SET reset_password_token = @hash,
           reset_password_expires = @expires
       WHERE id = @id`,
      { hash: resetTokenHash, expires, id: user.id },
    );

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, user.nombre, resetLink);

    res.status(200).json({
      message:
        "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   RESET PASSWORD (PÚBLICO)
========================= */

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token y contraseña requeridos." });
  }

  try {
    z.string().min(6).parse(password);

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const result = await db.query(
      `SELECT id, reset_password_expires
       FROM usuarios
       WHERE reset_password_token = @hash`,
      { hash: tokenHash },
    );

    const user = result.rows[0];

    if (!user || new Date(user.reset_password_expires) < new Date()) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE usuarios
       SET password_hash = @password_hash,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = @id`,
      { password_hash, id: user.id },
    );

    res.json({ message: "Contraseña restablecida correctamente." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

module.exports = router;
