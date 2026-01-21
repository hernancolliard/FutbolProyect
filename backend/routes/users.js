const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("../db");
const validate = require("../middleware/validateMiddleware");
const { verificarToken } = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../services/emailService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Esquema de validación para el registro
const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  tipo_usuario: z.enum(["postulante", "ofertante", "agencia"]),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  dni: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  pais: z.string().optional(),
});

// Endpoint de Registro
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
      "SELECT * FROM usuarios WHERE email = @email",
      { email }
    );
    if (userExists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "El correo electrónico ya está en uso." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const queryText = `INSERT INTO usuarios (nombre, apellido, telefono, email, password_hash, dni, direccion, ciudad, pais, tipo_usuario) 
                           VALUES (@nombre, @apellido, @telefono, @email, @password_hash, @dni, @direccion, @ciudad, @pais, @tipo_usuario)
                                                      RETURNING id, nombre, apellido, email, tipo_usuario, isadmin`;
    const newUserResult = await db.query(queryText, {
      nombre,
      email,
      password_hash,
      tipo_usuario,
      apellido: apellido || null,
      telefono: telefono || null,
      dni: dni || null,
      direccion: direccion || null,
      ciudad: ciudad || null,
      pais: pais || null,
    });
    const newUser = newUserResult.rows[0];

    // Crear perfil de usuario con foto por defecto
    const defaultProfilePhoto = "/images/logos/logofpazul.webp";
    await db.query(
      "INSERT INTO perfiles_usuario (id_usuario, foto_perfil_url) VALUES (@id_usuario, @foto_perfil_url)",
      {
        id_usuario: newUser.id,
        foto_perfil_url: defaultProfilePhoto,
      }
    );

    try {
      await sendWelcomeEmail(newUser.email, newUser.nombre, newUser.tipo_usuario);
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
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = @email",
      { email }
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const payload = {
      id: user.id,
      name: user.nombre,
      tipo_usuario: user.tipo_usuario,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Setting token cookie in /login");
    // CÓDIGO CORREGIDO Y MEJORADO
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // <-- ESTA ES LA LÍNEA CLAVE QUE SOLUCIONA EL PROBLEMA
      expires: new Date(Date.now() + 3600000), // Opcional: la cookie expira en 1 hora
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
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
    const googlePayload = ticket.getPayload();
    const { email, name } = googlePayload;

    let result = await db.query("SELECT * FROM usuarios WHERE email = @email", {
      email,
    });

    if (result.rows.length === 0) {
      const defaultPassword = crypto.randomBytes(16).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(defaultPassword, salt);

      const queryText = `INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario) 
                           VALUES (@nombre, @email, @password_hash, 'postulante')
                           RETURNING *`;
      result = await db.query(queryText, {
        nombre: name,
        email,
        password_hash,
      });

      // Crear perfil de usuario con foto por defecto para el nuevo usuario de Google
      const newUser = result.rows[0];
      const defaultProfilePhoto = "/images/logos/logofpazul.webp";
      await db.query(
        "INSERT INTO perfiles_usuario (id_usuario, foto_perfil_url) VALUES (@id_usuario, @foto_perfil_url)",
        {
          id_usuario: newUser.id,
          foto_perfil_url: defaultProfilePhoto,
        }
      );

      try {
        await sendWelcomeEmail(newUser.email, newUser.nombre, 'postulante');
      } catch (emailError) {
        console.error("Error al enviar el correo de bienvenida:", emailError);
      }
    }

    const user = result.rows[0];
    const payload = {
      id: user.id,
      name: user.nombre,
      tipo_usuario: user.tipo_usuario,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Setting token cookie in /auth/google");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // Asegura que la cookie esté disponible para todas las rutas
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Error en la autenticación de Google:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al autenticar con Google." });
  }
});

// Endpoint para cerrar sesión
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Cierre de sesión exitoso." });
});

// Endpoint para verificar el estado de autenticación del usuario
router.get("/me", verificarToken, async (req, res) => {
  try {
    // El middleware verificarToken ya ha puesto los datos del usuario en req.user
    // pero queremos los datos más frescos de la BD.
    const result = await db.query("SELECT * FROM usuarios WHERE id = @id", {
      id: req.user.id,
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const { password_hash, ...userWithoutPassword } = result.rows[0];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor." });
  }
});

// RUTA: Solicitar restablecimiento de contraseña
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await db.query("SELECT id, email, nombre FROM usuarios WHERE email = @email", { email });
    const user = userResult.rows[0];

    if (!user) {
      // Devolver un 200 OK incluso si el usuario no existe para evitar enumeración de usuarios
      return res.status(200).json({ message: "Si tu correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña." });
    }

    // Generar un token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora en milisegundos

    // Guardar el token hasheado y su expiración en la base de datos
    await db.query(
      "UPDATE usuarios SET reset_password_token = @resetTokenHash, reset_password_expires = @resetTokenExpiry WHERE id = @id",
      { resetTokenHash, resetTokenExpiry, id: user.id }
    );

    // Enviar correo electrónico con el enlace de restablecimiento
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.nombre, resetLink);

    res.status(200).json({ message: "Si tu correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña." });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error del servidor al procesar la solicitud." });
  }
});

// RUTA: Restablecer contraseña
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  // Validar la nueva contraseña con Zod
  const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres.");
  try {
    passwordSchema.parse(newPassword);
  } catch (err) {
    return res.status(400).json({ message: err.errors[0].message });
  }

  try {
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const userResult = await db.query(
      "SELECT id, reset_password_expires FROM usuarios WHERE reset_password_token = @resetTokenHash",
      { resetTokenHash }
    );
    const user = userResult.rows[0];

    if (!user || user.reset_password_expires < Date.now()) {
      return res.status(400).json({ message: "El token de restablecimiento es inválido o ha expirado." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query(
      "UPDATE usuarios SET password_hash = @password_hash, reset_password_token = NULL, reset_password_expires = NULL WHERE id = @id",
      { password_hash, id: user.id }
    );

    res.status(200).json({ message: "Tu contraseña ha sido restablecida con éxito." });
  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(500).json({ message: "Error del servidor al restablecer la contraseña." });
  }
});

module.exports = router;

module.exports = router;
