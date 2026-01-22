/* =====================================================
   SOLO USUARIOS OFERTANTES (ADMIN BYPASS)
===================================================== */
const requireOfertante = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "No autenticado.",
    });
  }

  // Admin bypass
  if (req.user.isadmin) {
    return next();
  }

  if (req.user.tipo_usuario !== "OFERTANTE") {
    return res.status(403).json({
      message: "Solo los usuarios ofertantes pueden crear ofertas.",
    });
  }

  next();
};

module.exports = requireOfertante;
