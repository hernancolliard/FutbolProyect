const jwt = require("jsonwebtoken");
const db = require("../db");
const { getRequiredSubscriptionPlan } = require("../subscriptionAccess");

/* =====================================================
   VERIFICAR TOKEN (COOKIE O AUTH HEADER)
===================================================== */
const verificarToken = (req, res, next) => {
  // El token Bearer representa explícitamente la sesión activa del cliente.
  // La cookie queda como fallback para clientes que no usan localStorage.
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    token = req.cookies?.token;
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
    console.error("Error al verificar el token JWT:", error.message);

    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }
};

/* =====================================================
   VERIFICAR TOKEN OPCIONAL
   Las rutas públicas continúan funcionando sin sesión, pero pueden
   personalizar la respuesta cuando reciben un token válido.
===================================================== */
const verificarTokenOpcional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    token = req.cookies?.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      tipo_usuario: decoded.tipo_usuario,
      isadmin: decoded.isadmin ?? false,
    };
  } catch {
    // Un token vencido o inválido en una ruta pública equivale a una visita anónima.
    req.user = null;
  }

  next();
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

      // 2️⃣ Verificar tipo de usuario (normalizar a minúsculas)
      const tiposPermitidosNormalizados = tiposPermitidos.map(t => t.toLowerCase());
      const tipoUsuarioNormalizado = req.user.tipo_usuario?.toLowerCase();
      
      console.log(`[SUSCRIPCIÓN] Verificando tipo de usuario:`, {
        esperados: tiposPermitidosNormalizados,
        actual: tipoUsuarioNormalizado,
      });
      
      if (
        tiposPermitidosNormalizados.length > 0 &&
        !tiposPermitidosNormalizados.includes(tipoUsuarioNormalizado)
      ) {
        console.log(`[SUSCRIPCIÓN] ❌ Tipo de usuario no permitido: ${req.user.tipo_usuario}`);
        return res.status(403).json({
          message: `Acción no permitida para tu tipo de usuario (${req.user.tipo_usuario}). Se requiere uno de: ${tiposPermitidos.join(", ")}.`,
        });
      }

      // 3️⃣ Verificar suscripción activa
      const requiredPlan = getRequiredSubscriptionPlan(tipoUsuarioNormalizado);

      if (!requiredPlan) {
        return res.status(403).json({
          message:
            "No existe un plan de suscripcion compatible con tu tipo de usuario.",
        });
      }

      const subResult = await db.query(
        `SELECT id, plan, estado, fecha_fin 
         FROM suscripciones
         WHERE id_usuario = @id
           AND estado = 'activa'
           AND fecha_fin > NOW()
           AND LOWER(TRIM(plan)) = @requiredPlan`,
        { id: req.user.id, requiredPlan },
      );

      if (subResult.rows.length === 0) {
        console.log(`[SUSCRIPCIÓN] ❌ Sin suscripción activa para usuario ${req.user.id}`);
        return res.status(403).json({
          message:
            "Acceso denegado. Se requiere una suscripción activa para realizar esta acción.",
        });
      }

      console.log(`[SUSCRIPCIÓN] ✅ Usuario ${req.user.id} tiene suscripción válida:`, subResult.rows[0]);
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
  verificarTokenOpcional,
  verificarAdmin,
  verificarSuscripcionActiva,
  popularRolUsuario,
};
