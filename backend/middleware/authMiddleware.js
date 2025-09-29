const jwt = require("jsonwebtoken");
const db = require("../db");

// Middleware para verificar que el usuario está autenticado (leyendo el token desde una cookie)
const verificarToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401) // 401 Unauthorized es más apropiado que 403 Forbidden
      .json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Añade el payload del token a la request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// Middleware para verificar que el usuario es un administrador
const verificarAdmin = async (req, res, next) => {
    // Se asume que verificarToken ya se ejecutó y pobló req.user con el ID
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Token no válido." });
    }

    try {
        // **CONSULTA A LA BASE DE DATOS**
        const result = await db.query(
            "SELECT isadmin FROM usuarios WHERE id = @id",
            { id: req.user.id }
        );

        const user = result.rows[0];

        if (!user || !user.isadmin) {
            return res
                .status(403)
                .json({
                    message: "Acción no permitida. Se requiere rol de administrador.",
                });
        }
        
        // Opcional: Anexar el rol actualizado a req.user si es necesario
        req.user.isadmin = user.isadmin; 
        next();
    } catch (error) {
        console.error("Error al verificar administrador:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
};

// Middleware para verificar que el usuario tiene una suscripción activa y el tipo correcto
const verificarSuscripcionActiva =
  (tiposPermitidos = []) =>
  async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Token no válido." });
      }
      
      const { id, tipo_usuario } = req.user;

      // Verificar si el usuario es administrador
      const adminResult = await db.query(
        "SELECT isadmin FROM usuarios WHERE id = @id",
        { id: req.user.id }
      );
      
      const userIsAdmin = adminResult.rows[0] && adminResult.rows[0].isadmin;
      req.user.isadmin = userIsAdmin; // poblar para uso posterior si es necesario

      // Si el usuario es admin, se salta todas las comprobaciones y se le da acceso.
      if (userIsAdmin) {
        return next();
      }

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
      const resultado = await db.query(
        "SELECT * FROM suscripciones WHERE id_usuario = @id AND estado = 'activa' AND fecha_fin > NOW()",
        { id }
      );

      if (resultado.rows.length === 0) {
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

module.exports = { verificarToken, verificarAdmin, verificarSuscripcionActiva, popularRolUsuario };
