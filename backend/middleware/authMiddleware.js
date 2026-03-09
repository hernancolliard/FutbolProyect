const jwt = require("jsonwebtoken");
const db = require("../db");

/* =====================================================
   VERIFICAR TOKEN (COOKIE O AUTH HEADER)
===================================================== */
const verificarToken = (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback: Authorization Bearer
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Acceso denegado. No se proporcionó un token.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Payload mínimo y controlado
    req.user = {
      id: decoded.id,
      tipo_usuario: decoded.tipo_usuario,
      isadmin: decoded.isadmin ?? false, // fallback
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }
};

/* =====================================================
   VERIFICAR ADMINISTRADOR
===================================================== */
const verificarAdmin = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Token no válido." });
  }

  try {
    const result = await db.query(
      "SELECT isadmin FROM usuarios WHERE id = @id",
      { id: req.user.id },
    );

    const user = result.rows[0];

    if (!user || !user.isadmin) {
      return res.status(403).json({
        message: "Acción no permitida. Se requiere rol de administrador.",
      });
    }

    req.user.isadmin = true;
    next();
  } catch (error) {
    console.error("Error al verificar administrador:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

/* =====================================================
   VERIFICAR SUSCRIPCIÓN ACTIVA + TIPO DE USUARIO
===================================================== */
const verificarSuscripcionActiva =
  (tiposPermitidos = []) =>
  async (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Token no válido." });
    }

    try {
      // 1️⃣ Consultar rol admin (una sola vez)
      const adminResult = await db.query(
        "SELECT isadmin FROM usuarios WHERE id = @id",
        { id: req.user.id },
      );

      const isAdmin = adminResult.rows[0]?.isadmin || false;
      req.user.isadmin = isAdmin;

      // Admin bypass total
      if (isAdmin) {
        return next();
      }

      // 2️⃣ Verificar tipo de usuario
      if (
        tiposPermitidos.length > 0 &&
        !tiposPermitidos.includes(req.user.tipo_usuario)
      ) {
        return res.status(403).json({
          message: `Acción no permitida para tu tipo de usuario (${req.user.tipo_usuario}).`,
        });
      }

      // 3️⃣ Verificar suscripción activa
      const subResult = await db.query(
        `SELECT id FROM suscripciones
         WHERE id_usuario = @id
           AND estado = 'activa'
           AND fecha_fin > NOW()`,
        { id: req.user.id },
      );

      if (subResult.rows.length === 0) {
        return res.status(403).json({
          message:
            "Acceso denegado. Se requiere una suscripción activa para realizar esta acción.",
        });
      }

      next();
    } catch (error) {
      console.error("Error al verificar suscripción:", error);
      res.status(500).json({
        message: "Error del servidor al verificar la suscripción.",
      });
    }
  };

/* =====================================================
   POPULAR ROL (OPCIONAL)
===================================================== */
const popularRolUsuario = async (req, res, next) => {
  if (!req.user?.id) {
    req.user = { ...req.user, isadmin: false };
    return next();
  }

  try {
    const result = await db.query(
      "SELECT isadmin FROM usuarios WHERE id = @id",
      { id: req.user.id },
    );

    req.user.isadmin = result.rows[0]?.isadmin || false;
    next();
  } catch (error) {
    console.error("Error al popular rol del usuario:", error);
    req.user.isadmin = false;
    next();
  }
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarSuscripcionActiva,
  popularRolUsuario,
};
