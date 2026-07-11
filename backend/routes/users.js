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
const { createReferralForUser } = require("../services/affiliateService");
const { clearAffiliateCookie } = require("../services/affiliateCookieService");
const { validateNewPassword } = require("../passwordPolicy");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const DUPLICATE_EMAIL_MESSAGE = "Ya existe un usuario registrado con ese email.";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("token", authCookieOptions);

  // Elimina también cookies creadas por versiones anteriores con Domain.
  const legacyDomains = new Set([
    process.env.COOKIE_DOMAIN,
    process.env.NODE_ENV === "production"
      ? "futbolproyect.onrender.com"
      : undefined,
  ]);

  legacyDomains.forEach((domain) => {
    if (domain) {
      res.clearCookie("token", { ...authCookieOptions, domain });
    }
  });
};

/* =========================
   LOGIN NORMAL
========================= */
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = @email",
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
      { id: user.id, tipo_usuario: user.tipo_usuario, isadmin: user.isadmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    clearAuthCookies(res);
    setAuthCookie(res, token);

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

    const { email: googleEmail, name } = ticket.getPayload();
    const email = normalizeEmail(googleEmail);

    let result = await db.query("SELECT * FROM usuarios WHERE LOWER(TRIM(email)) = @email", {
      email,
    });

    let user = result.rows[0];

    if (!user) {
      // La columna es NOT NULL, pero este valor aleatorio nunca se usa para
      // autenticar: las cuentas creadas aquí ingresan únicamente con Google.
      const passwordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString("hex"),
        12,
      );
      const created = await db.query(
        `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario)
         VALUES (@name, @email, @passwordHash, 'ofertante')
         RETURNING *`,
        { name, email, passwordHash },
      );
      user = created.rows[0];
      try {
        await createReferralForUser({
          req,
          userId: user.id,
          userEmail: user.email,
          manualCode: req.body.affiliateCode,
        });
        clearAffiliateCookie(res);
      } catch (affiliateError) {
        console.error("Error guardando atribucion de afiliado Google:", affiliateError);
      }
      await sendWelcomeEmail(user.email, user.nombre, user.tipo_usuario);
    }

    const jwtToken = jwt.sign(
      { id: user.id, tipo_usuario: user.tipo_usuario, isadmin: user.isadmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    clearAuthCookies(res);
    setAuthCookie(res, jwtToken);

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
      `SELECT u.id, u.nombre, u.email, u.tipo_usuario, u.rol, u.isadmin,
              EXISTS(
                SELECT 1 FROM affiliates a WHERE a.user_id = u.id
              ) as is_affiliate,
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
   CAMBIO DE CONTRASEÑA DEL USUARIO AUTENTICADO
========================= */
router.put("/me/password", verificarToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ message: "La contraseña actual es obligatoria." });
  }

  const passwordError = validateNewPassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: "La nueva contraseña debe ser diferente de la actual.",
    });
  }

  try {
    const result = await db.query(
      "SELECT password_hash FROM usuarios WHERE id = @id",
      { id: req.user.id },
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "La contraseña actual es incorrecta." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE usuarios
       SET password_hash = @passwordHash,
           reset_password_token = NULL,
           reset_password_expires = NULL
       WHERE id = @id`,
      { passwordHash, id: req.user.id },
    );

    return res.json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "No se pudo actualizar la contraseña." });
  }
});

/* =========================
   REGISTRO DE NUEVO USUARIO
========================= */
router.post("/register", async (req, res) => {
  const { nombre, password, tipo_usuario, rol } = req.body;
  const email = normalizeEmail(req.body.email);
  const affiliateCode =
    typeof req.body.affiliateCode === "string" ? req.body.affiliateCode : "";

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

    // Validación de rol
    const rolesValidos = {
      postulante: ["jugador", "entrenador", "ayudante", "analista"],
      ofertante: ["club", "agente", "scout"]
    };
    if (!rol || !rolesValidos[tipo_usuario].includes(rol)) {
      return res
        .status(400)
        .json({ message: "Rol inválido para el tipo de usuario." });
    }

    // Verificar si el email ya existe
    const existingUser = await db.query(
      "SELECT id FROM usuarios WHERE LOWER(TRIM(email)) = @email",
      { email }
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const client = await db.getClient();
    let result;
    try {
      await client.query("BEGIN");

      // Insertar el nuevo usuario
      result = await client.query(
        `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario, rol)
         VALUES (@nombre, @email, @password_hash, @tipo_usuario, @rol)
         RETURNING id, nombre, email, tipo_usuario, rol`,
        {
          nombre,
          email,
          password_hash,
          tipo_usuario,
          rol,
        }
      );

      try {
        await createReferralForUser({
          client,
          req,
          userId: result.rows[0].id,
          userEmail: email,
          manualCode: affiliateCode,
        });
      } catch (affiliateError) {
        console.error("Error guardando atribucion de afiliado:", affiliateError);
      }

      await client.query("COMMIT");
    } catch (createError) {
      await client.query("ROLLBACK");
      throw createError;
    } finally {
      client.release();
    }

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
      { expiresIn: "24h" }
    );

    clearAuthCookies(res);
    setAuthCookie(res, token);
    clearAffiliateCookie(res);

    res.status(201).json({
      message: "Registro exitoso.",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    if (err.code === "23505") {
      return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE });
    }
    res.status(500).json({ message: "Error del servidor." });
  }
});

/* =========================
   SOLICITUD DE RESTABLECIMIENTO DE CONTRASEÑA
========================= */
router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "El email es obligatorio." });
  }

  try {
    const result = await db.query("SELECT id, nombre FROM usuarios WHERE LOWER(TRIM(email)) = @email", { email });
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
router.delete("/me", verificarToken, async (req, res) => {
  const userId = req.user.id;
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM postulaciones WHERE id_usuario_postulante = @userId",
      { userId }
    );

    const result = await client.query(
      "DELETE FROM usuarios WHERE id = @userId RETURNING id",
      { userId }
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    await client.query("COMMIT");

    clearAuthCookies(res);

    res.json({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar cuenta:", error);
    res.status(500).json({ message: "Error del servidor al eliminar la cuenta." });
  } finally {
    client.release();
  }
});

router.post("/logout", (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logout exitoso." });
});

module.exports = router;
