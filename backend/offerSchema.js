const { z } = require("zod");

// --- Esquema de validación para la creación de ofertas ---
const offerSchema = z.object({
  titulo: z.string().min(5).max(100),
  descripcion: z.string().min(20),
  puesto: z.string().min(3).optional().or(z.literal("")),
  ubicacion: z.string().min(3).optional().or(z.literal("")),
  salario: z.preprocess(
    (val) => (val ? parseFloat(val) : undefined),
    z.number().positive().optional(),
  ),
  horarios: z.string().optional(),
  nivel: z.string().optional(),
  detalles_adicionales: z.string().optional(),
});

module.exports = { offerSchema };
