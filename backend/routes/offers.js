const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { z } = require("zod");
const db = require("../db");
const {
  verificarToken,
  verificarAdmin,
  verificarSuscripcionActiva,
  popularRolUsuario,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { translateText } = require("../services/translationService");
const { uploadToS3 } = require("../services/s3Service");

// --- Configuración de Caché en Memoria ---
const NodeCache = require("node-cache");
// El caché se guardará por 3 minutos (180 segundos)
const myCache = new NodeCache({ stdTTL: 180 });

// --- Esquema de validación para la creación de ofertas ---
const offerSchema = z.object({
  titulo: z.string().min(5).max(100),
  descripcion: z.string().min(20),
  puesto: z.string().min(3).optional().or(z.literal("")),
  ubicacion: z.string().min(3).optional().or(z.literal("")),
  salario: z.preprocess(
    (val) => (val ? parseFloat(val) : undefined),
    z.number().positive().optional()
  ),
  horarios: z.string().optional(),
  nivel: z.string().optional(),
  detalles_adicionales: z.string().optional(),
});

// --- Configuración de Multer para la subida de archivos ---
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// --- Middleware para procesar y subir imágenes de ofertas a S3 ---
const processOfferImages = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  req.body.processedImages = {};

  try {
    for (const field in req.files) {
      const file = req.files[field][0];

      // 1. Generar un nombre de archivo base único
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileBase = `${file.fieldname}-${uniqueSuffix}`;

      // 2. Preparar buffers de imagen en formato WebP
      const originalWebpBuffer = await sharp(file.buffer)
        .webp({ quality: 85 })
        .toBuffer();
      const mediumWebpBuffer = await sharp(file.buffer)
        .resize(800)
        .webp({ quality: 80 })
        .toBuffer();
      const thumbWebpBuffer = await sharp(file.buffer)
        .resize(300)
        .webp({ quality: 80 })
        .toBuffer();

      // 3. Subir todas las versiones a S3 en paralelo
      const [originalUrl, mediumUrl, thumbUrl] = await Promise.all([
        uploadToS3(
          originalWebpBuffer,
          `offers/${fileBase}.webp`,
          "image/webp"
        ),
        uploadToS3(
          mediumWebpBuffer,
          `offers/${fileBase}_medium.webp`,
          "image/webp"
        ),
        uploadToS3(
          thumbWebpBuffer,
          `offers/${fileBase}_thumb.webp`,
          "image/webp"
        ),
      ]);

      // 4. Guardar las URLs de S3 para la base de datos
      req.body.processedImages[field] = {
        original: originalUrl,
        medium: mediumUrl,
        thumb: thumbUrl,
      };
    }
    next();
  } catch (error) {
    console.error("Error procesando y subiendo imágenes a S3:", error);
    next(error);
  }
};

// --- RUTA PÚBLICA: OBTENER TODAS LAS OFERTAS (CON FILTROS Y CACHÉ) ---
router.get("/", async (req, res) => {
  const {
    puesto,
    ubicacion,
    nivel,
    horarios,
    salarioMin,
    salarioMax,
    sort = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const cacheKey = `offers:${puesto || "all"}:${ubicacion || "all"}:${
    nivel || "all"
  }:${horarios || "all"}:${salarioMin || "none"}-${
    salarioMax || "none"
  }:${sort}:page${page}:limit${limit}`;

  try {
    // 1. Intentar obtener los datos desde el caché en memoria
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
      // console.log("Sirviendo desde caché en memoria:", cacheKey);
      return res.json(cachedData);
    }

    // console.log("Sirviendo desde la base de datos, no hay caché.");

    // 2. Desactivar ofertas destacadas caducadas (se ejecuta siempre)
    const unfeatureQuery = `
      UPDATE ofertas_laborales
      SET is_featured = FALSE
      WHERE is_featured = TRUE AND featured_until <= NOW();
    `;
    await db.query(unfeatureQuery);

    // 3. Construir la consulta dinámica para ofertas regulares
    let whereClauses = ["o.estado = 'abierta'", "o.is_featured = FALSE"];
    let queryParams = {};

    if (puesto) {
      whereClauses.push(`o.puesto LIKE @puesto`);
      queryParams.puesto = `%${puesto}%`;
    }
    if (ubicacion) {
      whereClauses.push(`o.ubicacion LIKE @ubicacion`);
      queryParams.ubicacion = `%${ubicacion}%`;
    }
    if (nivel) {
      whereClauses.push(`o.nivel = @nivel`);
      queryParams.nivel = nivel;
    }
    if (horarios) {
      whereClauses.push(`o.horarios = @horarios`);
      queryParams.horarios = horarios;
    }
    if (salarioMin) {
      whereClauses.push(`o.salario >= @salarioMin`);
      queryParams.salarioMin = salarioMin;
    }
    if (salarioMax) {
      whereClauses.push(`o.salario <= @salarioMax`);
      queryParams.salarioMax = salarioMax;
    }

    const whereString = whereClauses.join(" AND ");

    const orderBy =
      sort === "asc" ? "o.fecha_publicacion ASC" : "o.fecha_publicacion DESC";

    // 4. Obtener el conteo total de ofertas para la paginación
    const countQuery = `SELECT COUNT(*) as total FROM ofertas_laborales o WHERE ${whereString}`;
    const countResult = await db.query(countQuery, queryParams);
    const totalOffers = countResult.rows[0].total;
    const totalPages = Math.ceil(totalOffers / limit);

    // 5. Obtener las ofertas regulares paginadas y ordenadas
    const offset = (page - 1) * limit;
    const regularQuery = `
      SELECT o.id, o.titulo, o.descripcion, o.ubicacion, o.fecha_publicacion, o.imagen_url as imagen_url, u.nombre as nombre_ofertante, o.puesto, o.is_featured, o.nivel, o.horarios, o.salario
      FROM ofertas_laborales o
      JOIN usuarios u ON o.id_usuario_ofertante = u.id
      WHERE ${whereString}
      ORDER BY ${orderBy}
      OFFSET @offset LIMIT @limit;
    `;
    queryParams.offset = offset;
    queryParams.limit = parseInt(limit);

    const regularResult = await db.query(regularQuery, queryParams);
    const regularOffers = regularResult.rows;

    // 6. Obtener las ofertas destacadas (estas no se filtran, siempre son las mismas)
    let featuredQuery = `
      SELECT o.id, o.titulo, o.descripcion, o.ubicacion, o.fecha_publicacion, o.imagen_url as imagen_url, u.nombre as nombre_ofertante, o.puesto, o.is_featured, o.nivel, o.horarios, o.salario
      FROM ofertas_laborales o
      JOIN usuarios u ON o.id_usuario_ofertante = u.id
      WHERE o.estado = 'abierta' AND o.is_featured = TRUE AND o.featured_until > NOW()
      ORDER BY o.featured_until DESC
      LIMIT 6;
    `;
    const featuredResult = await db.query(featuredQuery);
    const featuredOffers = featuredResult.rows;

    // 7. Preparar los datos para enviar y cachear
    const responseData = {
      featuredOffers,
      offers: regularOffers,
      totalPages,
      currentPage: parseInt(page),
    };

    // 8. Guardar en caché en memoria
    myCache.set(cacheKey, responseData);

    // 9. Devolver la respuesta
    res.json(responseData);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las ofertas." });
  }
});

// --- RUTA PÚBLICA: OBTENER UNA OFERTA POR ID ---
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `
      SELECT o.id, o.titulo, o.descripcion, o.ubicacion, o.fecha_publicacion, 
             o.imagen_url, 
             o.detalles_adicionales, u.nombre as nombre_ofertante, o.id_usuario_ofertante, 
             o.puesto, o.salario, o.nivel, o.horarios, o.is_featured
      FROM ofertas_laborales o
      JOIN usuarios u ON o.id_usuario_ofertante = u.id
      WHERE o.id = @id
    `,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Oferta no encontrada." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener oferta por ID:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener la oferta." });
  }
});

// --- RUTA PROTEGIDA: CREAR UNA NUEVA OFERTA ---
router.post(
  "/",
  verificarToken,
  verificarSuscripcionActiva(["ofertante", "agencia"]),
  upload.fields([{ name: "imagen_url", maxCount: 1 }]),
  processOfferImages,
  validate(offerSchema),
  async (req, res) => {
    const {
      titulo,
      descripcion,
      puesto,
      ubicacion,
      salario,
      horarios,
      nivel,
      detalles_adicionales,
      processedImages,
    } = req.body;
    const id_usuario_ofertante = req.user.id;

    try {
      // Traducción de los campos
      const [
        titulo_trans,
        desc_trans,
        puesto_trans,
        ubicacion_trans,
        horarios_trans,
        nivel_trans,
        detalles_trans,
      ] = await Promise.all([
        translateText(titulo),
        translateText(descripcion),
        translateText(puesto),
        translateText(ubicacion),
        translateText(horarios),
        translateText(nivel),
        translateText(detalles_adicionales),
      ]);

      const query = `
                INSERT INTO ofertas_laborales (
          id_usuario_ofertante, titulo, descripcion, puesto, ubicacion, salario, 
          horarios, nivel, detalles_adicionales, estado, 
          imagen_url,
          titulo_es, titulo_en, descripcion_es, descripcion_en, puesto_es, puesto_en,
          ubicacion_es, ubicacion_en, horarios_es, horarios_en, nivel_es, nivel_en,
          detalles_adicionales_es, detalles_adicionales_en
        ) 
        VALUES (
          @id_usuario_ofertante, @titulo, @descripcion, @puesto, @ubicacion, @salario, 
          @horarios, @nivel, @detalles_adicionales, 'abierta', 
          @imagen_url,
          @titulo_es, @titulo_en, @descripcion_es, @descripcion_en, @puesto_es, @puesto_en,
          @ubicacion_es, @ubicacion_en, @horarios_es, @horarios_en, @nivel_es, @nivel_en,
          @detalles_adicionales_es, @detalles_adicionales_en
        )
        RETURNING id;
      `;

      const result = await db.query(query, {
        id_usuario_ofertante,
        titulo,
        descripcion,
        puesto,
        ubicacion,
        salario: salario || null,
        horarios: horarios || null,
        nivel: nivel || null,
        detalles_adicionales: detalles_adicionales || null,
        imagen_url: processedImages?.imagen_url?.original || null,
        titulo_es: titulo_trans.es,
        titulo_en: titulo_trans.en,
        descripcion_es: desc_trans.es,
        descripcion_en: desc_trans.en,
        puesto_es: puesto_trans.es,
        puesto_en: puesto_trans.en,
        ubicacion_es: ubicacion_trans.es,
        ubicacion_en: ubicacion_trans.en,
        horarios_es: horarios_trans.es,
        horarios_en: horarios_trans.en,
        nivel_es: nivel_trans.es,
        nivel_en: nivel_trans.en,
        detalles_adicionales_es: detalles_trans.es,
        detalles_adicionales_en: detalles_trans.en,
      });

      const newOfferId = result.rows[0].id;

      // Invalidar el caché para que la nueva oferta aparezca inmediatamente
      myCache.flushAll();

      res.status(201).json({
        message: "Oferta creada con éxito",
        offerId: newOfferId,
      });
    } catch (error) {
      console.error("Error al crear la oferta:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al crear la oferta." });
    }
  }
);

// --- RUTA PROTEGIDA: ACTUALIZAR UNA OFERTA ---
router.put(
  "/:id",
  verificarToken,
  popularRolUsuario,
  upload.fields([{ name: "imagen_url", maxCount: 1 }]),
  processOfferImages,
  validate(offerSchema),
  async (req, res) => {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      puesto,
      ubicacion,
      salario,
      horarios,
      nivel,
      detalles_adicionales,
      processedImages,
    } = req.body;
    const id_usuario_actual = req.user.id;
            const esAdmin = req.user.isadmin; // Corregido para ser consistente con el payload del JWT

    try {
      // 1. Verificar que la oferta existe y obtener el dueño
      const offerQuery = `SELECT id_usuario_ofertante FROM ofertas_laborales WHERE id = @id`;
      const offerResult = await db.query(offerQuery, { id });

      if (offerResult.rows.length === 0) {
        return res.status(404).json({ message: "Oferta no encontrada." });
      }

      const id_dueño_oferta = offerResult.rows[0].id_usuario_ofertante;

      // 2. Verificar permisos (solo el dueño o un admin pueden editar)
      if (id_dueño_oferta !== id_usuario_actual && !esAdmin) {
        return res
          .status(403)
          .json({ message: "No tienes permiso para editar esta oferta." });
      }

      // 3. Construir la consulta de actualización dinámica
      let updateFields = [];
      let queryParams = { id };

      if (titulo) {
        const titulo_trans = await translateText(titulo);
        updateFields.push("titulo = @titulo");
        updateFields.push("titulo_es = @titulo_es");
        updateFields.push("titulo_en = @titulo_en");
        queryParams.titulo = titulo;
        queryParams.titulo_es = titulo_trans.es;
        queryParams.titulo_en = titulo_trans.en;
      }
      if (descripcion) {
        const desc_trans = await translateText(descripcion);
        updateFields.push("descripcion = @descripcion");
        updateFields.push("descripcion_es = @descripcion_es");
        updateFields.push("descripcion_en = @descripcion_en");
        queryParams.descripcion = descripcion;
        queryParams.descripcion_es = desc_trans.es;
        queryParams.descripcion_en = desc_trans.en;
      }
      if (puesto) {
        const puesto_trans = await translateText(puesto);
        updateFields.push("puesto = @puesto");
        updateFields.push("puesto_es = @puesto_es");
        updateFields.push("puesto_en = @puesto_en");
        queryParams.puesto = puesto;
        queryParams.puesto_es = puesto_trans.es;
        queryParams.puesto_en = puesto_trans.en;
      }
      if (ubicacion) {
        const ubicacion_trans = await translateText(ubicacion);
        updateFields.push("ubicacion = @ubicacion");
        updateFields.push("ubicacion_es = @ubicacion_es");
        updateFields.push("ubicacion_en = @ubicacion_en");
        queryParams.ubicacion = ubicacion;
        queryParams.ubicacion_es = ubicacion_trans.es;
        queryParams.ubicacion_en = ubicacion_trans.en;
      }
      if (salario) {
        updateFields.push("salario = @salario");
        queryParams.salario = salario;
      }
      if (horarios) {
        const horarios_trans = await translateText(horarios);
        updateFields.push("horarios = @horarios");
        updateFields.push("horarios_es = @horarios_es");
        updateFields.push("horarios_en = @horarios_en");
        queryParams.horarios = horarios;
        queryParams.horarios_es = horarios_trans.es;
        queryParams.horarios_en = horarios_trans.en;
      }
      if (nivel) {
        const nivel_trans = await translateText(nivel);
        updateFields.push("nivel = @nivel");
        updateFields.push("nivel_es = @nivel_es");
        updateFields.push("nivel_en = @nivel_en");
        queryParams.nivel = nivel;
        queryParams.nivel_es = nivel_trans.es;
        queryParams.nivel_en = nivel_trans.en;
      }
      if (detalles_adicionales) {
        const detalles_trans = await translateText(detalles_adicionales);
        updateFields.push("detalles_adicionales = @detalles_adicionales");
        updateFields.push("detalles_adicionales_es = @detalles_adicionales_es");
        updateFields.push("detalles_adicionales_en = @detalles_adicionales_en");
        queryParams.detalles_adicionales = detalles_adicionales;
        queryParams.detalles_adicionales_es = detalles_trans.es;
        queryParams.detalles_adicionales_en = detalles_trans.en;
      }
      if (processedImages && processedImages.imagen_url) {
        updateFields.push("imagen_url = @imagen_url");
        queryParams.imagen_url = processedImages.imagen_url.original;
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ message: "No se proporcionaron campos para actualizar." });
      }

      const updateQuery = `
        UPDATE ofertas_laborales
        SET ${updateFields.join(", ")}
        WHERE id = @id;
      `;

      await db.query(updateQuery, queryParams);

      // Invalidar caché para esta oferta y listas de ofertas
      myCache.del(`offer:${id}`);
      myCache.flushAll(); // O invalidar selectivamente las claves de listas

      res.status(200).json({ message: "Oferta actualizada con éxito." });
    } catch (error) {
      console.error("Error al actualizar la oferta:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al actualizar la oferta." });
    }
  }
);

// --- RUTA PROTEGIDA: OBTENER POSTULANTES DE UNA OFERTA ---
router.get("/:offerId/applications", verificarToken, async (req, res) => {
  const { offerId } = req.params;
  const userId = req.user.id; // Asumiendo que verificarToken añade el usuario a req

  try {
    // Primero, verificar que el usuario actual es el dueño de la oferta
    const offerQuery = `SELECT id_usuario_ofertante FROM ofertas_laborales WHERE id = @offerId`;
    const offerResult = await db.query(offerQuery, { offerId });

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ message: "Oferta no encontrada." });
    }

    if (offerResult.rows[0].id_usuario_ofertante !== userId) {
      return res.status(403).json({
        message: "No tienes permiso para ver los postulantes de esta oferta.",
      });
    }

    // Si es el dueño, obtener los postulantes
    const applicantsQuery = `
        SELECT
          p.id,
          p.id_usuario_postulante AS id_usuario,
          p.id_oferta,
          p.fecha_postulacion,
          p.estado,
          u.nombre,
          u.email
        FROM postulaciones p
        JOIN usuarios u ON p.id_usuario_postulante = u.id
        WHERE p.id_oferta = @offerId
        ORDER BY p.fecha_postulacion DESC;
      `;
    const applicantsResult = await db.query(applicantsQuery, { offerId });

    res.json(applicantsResult.rows);
  } catch (error) {
    console.error("Error al obtener los postulantes:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener los postulantes." });
  }
});

// --- RUTA PROTEGIDA: POSTULARSE A UNA OFERTA ---
router.post(
  "/:offerId/apply",
  verificarToken, // Solo se requiere que el usuario esté logueado
  async (req, res) => {
    const { offerId } = req.params;
    const userId = req.user.id;

    try {
      // 1. Verificar que la oferta existe y no es del propio usuario
      const offerQuery = `SELECT id_usuario_ofertante FROM ofertas_laborales WHERE id = @offerId`;
      const offerResult = await db.query(offerQuery, { offerId });

      if (offerResult.rows.length === 0) {
        return res.status(404).json({ message: "Oferta no encontrada." });
      }
      if (offerResult.rows[0].id_usuario_ofertante === userId) {
        return res
          .status(403)
          .json({ message: "No puedes postularte a tu propia oferta." });
      }

      // 2. Verificar que el usuario no se haya postulado ya
      const applicationQuery = `SELECT id FROM postulaciones WHERE id_oferta = @offerId AND id_usuario_postulante = @userId`;
      const applicationResult = await db.query(applicationQuery, {
        offerId,
        userId,
      });

      if (applicationResult.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "Ya te has postulado a esta oferta." });
      }

      // 3. Crear la postulación
      const insertQuery = `
        INSERT INTO postulaciones (id_usuario_postulante, id_oferta, fecha_postulacion, estado)
        VALUES (@userId, @offerId, NOW(), 'enviada');
      `;
      await db.query(insertQuery, { userId, offerId });

      res.status(201).json({ message: "Postulación exitosa." });
    } catch (error) {
      console.error("Error al postularse a la oferta:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al procesar la postulación." });
    }
  }
);

module.exports = router;
