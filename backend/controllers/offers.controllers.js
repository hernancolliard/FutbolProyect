const db = require("../db");

/* =====================================================
   CREAR OFERTA
===================================================== */
const createOffer = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      ubicacion,
      puesto,
      salario,
      nivel,
      horarios,
      detalles_adicionales,
    } = req.body;

    const result = await db.query(
      `
      INSERT INTO ofertas (
        titulo,
        descripcion,
        ubicacion,
        puesto,
        salario,
        nivel,
        horarios,
        detalles_adicionales,
        id_usuario_ofertante
      )
      VALUES (
        @titulo,
        @descripcion,
        @ubicacion,
        @puesto,
        @salario,
        @nivel,
        @horarios,
        @detalles_adicionales,
        @id_usuario_ofertante
      )
      RETURNING *
      `,
      {
        titulo,
        descripcion,
        ubicacion,
        puesto,
        salario,
        nivel,
        horarios,
        detalles_adicionales,
        id_usuario_ofertante: req.user.id, // 🔐 CLAVE
      },
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear oferta:", error);
    res.status(500).json({
      message: "Error al crear la oferta.",
    });
  }
};

module.exports = {
  createOffer,
};
