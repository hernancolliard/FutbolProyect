const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const validate = require("../middleware/validateMiddleware");
const { verificarToken } = require("../middleware/authMiddleware");
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Esquema de validación para el registro
const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  apellido: z.string().min(1, "El apellido es requerido."),
  telefono: z.string().min(1, "El teléfono es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  dni: z.string().min(1, "El DNI es requerido."),
  direccion: z.string().min(1, "La dirección es requerida."),
  ciudad: z.string().min(1, "La ciudad es requerida."),
  pais: z.string().min(1, "El país es requerido."),
  tipo_usuario: z.enum(['postulante', 'ofertante', 'agencia']),
});

// Endpoint de Registro
router.post("/register", validate(registerSchema), async (req, res) => {
  const { nombre, apellido, telefono, email, password, dni, direccion, ciudad, pais, tipo_usuario } = req.body;

  try {
    const userExists = await db.query("SELECT * FROM usuarios WHERE email = @email", { email });
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "El correo electrónico ya está en uso." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const queryText = `INSERT INTO usuarios (nombre, apellido, telefono, email, password_hash, dni, direccion, ciudad, pais, tipo_usuario) 
                           VALUES (@nombre, @apellido, @telefono, @email, @password_hash, @dni, @direccion, @ciudad, @pais, @tipo_usuario)
                                                      RETURNING id, nombre, apellido, email, tipo_usuario, isadmin`;
    const newUserResult = await db.query(queryText, { nombre, apellido, telefono, email, password_hash, dni, direccion, ciudad, pais, tipo_usuario });
    const newUser = newUserResult.rows[0];

    try {
      await sendWelcomeEmail(newUser.email, newUser.nombre);
    } catch (emailError) {
      console.error("Error al enviar el correo de bienvenida:", emailError);
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// Endpoint de Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = @email", { email });
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const payload = { id: user.id, name: user.nombre, tipo_usuario: user.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    // Devolver datos del usuario sin el hash de la contraseña
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});

// Endpoint para autenticación con Google
router.post("/auth/google", async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const googlePayload = ticket.getPayload();
    const { email, name } = googlePayload;

    let result = await db.query("SELECT * FROM usuarios WHERE email = @email", { email });

    if (result.rows.length === 0) {
      const defaultPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(defaultPassword, salt);

      const queryText = `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario) 
                           VALUES (@nombre, @email, @password_hash, 'postulante')
                           RETURNING *`;
      result = await db.query(queryText, { nombre: name, email, password_hash });
    }

    const user = result.rows[0];
    const payload = { id: user.id, name: user.nombre, tipo_usuario: user.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error("Error en la autenticación de Google:", error);
    res.status(500).json({ message: "Error en el servidor al autenticar con Google." });
  }
});

// Endpoint para cerrar sesión
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Cierre de sesión exitoso.' });
});

// Endpoint para verificar el estado de autenticación del usuario
router.get('/me', verificarToken, async (req, res) => {
  try {
    // El middleware verificarToken ya ha puesto los datos del usuario en req.user
    // pero queremos los datos más frescos de la BD.
    const result = await db.query('SELECT * FROM usuarios WHERE id = @id', { id: req.user.id });
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const { password_hash, ...userWithoutPassword } = result.rows[0];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor.' });
  }
});


// ... (resto de las rutas como forgot-password, etc.)

module.exports = router;
