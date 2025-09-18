const jwt = require("jsonwebtoken");
const db = require("../db");

// Middleware para verificar que el usuario está autenticado
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res
      .status(403)
      .json({ message: "Se requiere un token para la autenticación." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Añade el payload del token (id, nombre, tipo_usuario) a la request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }
};

// Middleware para verificar que el usuario es un administrador
const verificarAdmin = (req, res, next) => {
  // Se asume que verificarToken ya se ejecutó y pobló req.user
  if (!req.user || !req.user.isAdmin) {
    return res
      .status(403)
      .json({
        message: "Acción no permitida. Se requiere rol de administrador.",
      });
  }
  next();
};

// Middleware para verificar que el usuario tiene una suscripción activa y el tipo correcto
const verificarSuscripcionActiva =
  (tiposPermitidos = []) =>
  async (req, res, next) => {
    // Si el usuario es admin, se salta todas las comprobaciones y se le da acceso.
    if (req.user && req.user.isAdmin) {
      return next();
    }

    try {
      const { id, tipo_usuario } = req.user;

      // 1. Verificar que el tipo de usuario es el permitido para esta acción
      if (
        tiposPermitidos.length > 0 &&
        !tiposPermitidos.includes(tipo_usuario)
      ) {
        return res
          .status(403)
          .json({
            message: `Acción no permitida para tu tipo de usuario (${tipo_usuario}).`,
          });
      }

      // 2. Verificar que la suscripción está activa en la base de datos
      // 2. Verificar que la suscripción está activa en la base de datos
      const resultado = await db.query(
        "SELECT * FROM suscripciones WHERE id_usuario = @id AND estado = 'activa' AND fecha_fin > NOW()",
        { id }
      );

      if (resultado.rows.length === 0) {

      if (resultado.recordset.length === 0) {
        return res
          .status(403)
          .json({
            message:
              "Acceso denegado. Se requiere una suscripción activa para realizar esta acción.",
          });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error del servidor al verificar la suscripción." });
    }
  };

module.exports = { verificarToken, verificarAdmin, verificarSuscripcionActiva };
