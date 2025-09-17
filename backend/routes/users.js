const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verificarToken } = require("../middleware/authMiddleware");
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Endpoint de Registro
router.post("/register", async (req, res) => {
  const { nombre, apellido, telefono, email, password, dni, direccion, ciudad, pais, tipo_usuario } = req.body;

  if (!nombre || !apellido || !telefono || !email || !password || !dni || !direccion || !ciudad || !pais || !tipo_usuario) {
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }

  try {
    // Verificar si el usuario ya existe
    const userExists = await db.query(
      "SELECT * FROM usuarios WHERE email = @email",
      { email }
    );
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está en uso." });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Guardar usuario y devolver los datos del nuevo usuario usando la cláusula OUTPUT
    const queryText = `INSERT INTO usuarios (nombre, apellido, telefono, email, password_hash, dni, direccion, ciudad, pais, tipo_usuario) 
                           RETURNING id, nombre, apellido, telefono, email, dni, direccion, ciudad, pais, tipo_usuario
                           VALUES (@nombre, @apellido, @telefono, @email, @password_hash, @dni, @direccion, @ciudad, @pais, @tipo_usuario)`;
    const newUser = await db.query(queryText, {
      nombre,
      apellido,
      telefono,
      email,
      password_hash,
      dni,
      direccion,
      ciudad,
      pais,
      tipo_usuario,
    });

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(newUser.rows[0].email, newUser.rows[0].nombre);
    } catch (emailError) {
      console.error("Error al enviar el correo de bienvenida:", emailError);
      // No bloquear el registro si el email falla. Registrar el error para revisión.
    }

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// Endpoint de Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = @email",
      { email }
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    // Crear y firmar el token JWT que se enviará al frontend
    const payload = {
      id: user.id,
      name: user.nombre,
      tipo_usuario: user.tipo_usuario,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// Endpoint para autenticación con Google
router.post("/auth/google", async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Buscar usuario por email
    let user = await db.query("SELECT * FROM usuarios WHERE email = @email", { email });

    if (user.rows.length === 0) {
      // Si el usuario no existe, registrarlo
      const defaultPassword = Math.random().toString(36).slice(-8); // Contraseña aleatoria
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(defaultPassword, salt);

      const queryText = `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario)
                           RETURNING id, nombre, email, tipo_usuario
                           VALUES (@nombre, @email, @password_hash, @tipo_usuario)`;
      const newUser = await db.query(queryText, {
        nombre: name,
        email,
        password_hash,
        tipo_usuario: "postulante", // Tipo de usuario por defecto para registros de Google
      });
      user = newUser;
    }

    // Generar JWT
    const tokenPayload = {
      id: user.rows[0].id,
      name: user.rows[0].nombre,
      tipo_usuario: user.rows[0].tipo_usuario,
      isAdmin: user.rows[0].isAdmin,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error en la autenticación de Google:", error);
    res.status(500).json({ message: "Error en el servidor al autenticar con Google." });
  }
});

// Endpoint para obtener el estado de la suscripción del usuario
router.get("/subscription-status", verificarToken, async (req, res) => {
  const userId = req.user.id; // ID del usuario autenticado

  try {
    const result = await db.query(
      "SELECT plan, fecha_fin, estado, metodo_pago FROM suscripciones WHERE id_usuario = @userId",
      { userId }
    );

    if (result.rows.length > 0) {
      res.json({ subscription: result.rows[0] });
    } else {
      res.json({ subscription: null, message: "No hay suscripción activa para este usuario." });
    }
  } catch (error) {
    console.error("Error al obtener el estado de la suscripción:", error);
    res.status(500).json({ message: "Error al obtener el estado de la suscripción." });
  }
});

// Endpoint para solicitar reseteo de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const userResult = await db.query("SELECT * FROM usuarios WHERE email = @email", { email });
    if (userResult.rows.length === 0) {
      // No revelar que el usuario no existe.
      return res.status(200).json({ message: "Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña." });
    }

    const user = userResult.rows[0];

    // Generar token
    const token = crypto.randomBytes(20).toString('hex');

    // Establecer fecha de expiración (1 hora)
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Guardar token y fecha de expiración en la base de datos
    const updateQuery = `
      UPDATE usuarios
      SET reset_password_token = @token,
          reset_password_expires = @expires
      WHERE id = @userId
    `;
    await db.query(updateQuery, { token, expires, userId: user.id });

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, token);
      res.status(200).json({ message: "Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña." });
    } catch (emailError) {
      console.error("Error al enviar el correo de reseteo:", emailError);
      // Aunque el email falle, no queremos que el usuario lo sepa para no darle pistas.
      // Podríamos tener un log interno más robusto aquí.
      res.status(200).json({ message: "Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña." });
    }

  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// Endpoint para resetear la contraseña
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    // Buscar usuario por el token y verificar que no haya expirado
    const findUserQuery = `
      SELECT * FROM usuarios
      WHERE reset_password_token = @token AND reset_password_expires > NOW()
    `;
    const userResult = await db.query(findUserQuery, { token });

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "El token para restablecer la contraseña es inválido o ha expirado." });
    }

    const user = userResult.rows[0];

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Actualizar contraseña y limpiar los campos de reseteo
    const updateQuery = `
      UPDATE usuarios
      SET password_hash = @password_hash,
          reset_password_token = NULL,
          reset_password_expires = NULL
      WHERE id = @userId
    `;
    await db.query(updateQuery, { password_hash, userId: user.id });

    res.status(200).json({ message: "La contraseña ha sido actualizada exitosamente." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

module.exports = router;