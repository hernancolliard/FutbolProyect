const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  verificarToken,
  popularRolUsuario,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { z } = require("zod");
const upload = require("../middleware/upload");
const path = require("path");
const sharp = require("sharp");
const { translateText } = require("../services/translationService");
const fs = require("fs");

const { uploadToS3 } = require("../services/s3Service");

// Helper para construir la URL completa
const getFullUrl = (req, filePath) => {
  return `${req.protocol}://${req.get("host")}/${filePath}`;
};

// --- RUTA PÚBLICA: OBTENER TODOS LOS PERFILES (CON FILTROS) ---
router.get("/", async (req, res) => {
  const { nacionalidad, puesto } = req.query;

  try {
    let queryParams = {};
    let whereClauses = ["u.tipo_usuario = 'postulante'"];

    if (nacionalidad) {
      queryParams.nacionalidad = nacionalidad;
      whereClauses.push(`p.nacionalidad = @nacionalidad`);
    }
    if (puesto) {
      queryParams.puesto = puesto;
      whereClauses.push(`p.posicion_principal = @puesto`);
    }

    const query = `
      SELECT
          u.id, u.nombre,
          u.apellido,
          COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          p.posicion_principal,
          p.nacionalidad,
          p.average_rating,
          p.total_ratings
      FROM
          usuarios u
      LEFT JOIN
          perfiles_usuario p ON u.id = p.id_usuario
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY
          u.id DESC;
    `;

    const result = await db.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener todos los perfiles:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});




// --- RUTA PÚBLICA: OBTENER PERFILES DESTACADOS ---
router.get("/featured", async (req, res) => {
      const { nacionalidad, puesto } = req.query;
  
    try {
      let queryParams = {}; // Usar un objeto para los parámetros nombrados
      let whereClauses = ["u.tipo_usuario = 'postulante'", "s.estado = 'activa'"];
  
      if (nacionalidad) {
        queryParams.nacionalidad = nacionalidad;
        whereClauses.push(`p.nacionalidad = @nacionalidad`);
      }
      if (puesto) {
        queryParams.puesto = puesto;
        whereClauses.push(`p.posicion_principal = @puesto`);
      }
  
      console.log("Featured Profiles Query - whereClauses:", whereClauses);
      console.log("Featured Profiles Query - queryParams:", queryParams);
  
      const query = `
        SELECT
            u.id,          u.nombre,
          u.apellido,
          COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url,
          p.posicion_principal,
          p.nacionalidad,
          p.average_rating, -- Añadir calificación promedio
          p.total_ratings -- Añadir conteo total de calificaciones
      FROM
          usuarios u
      JOIN
          perfiles_usuario p ON u.id = p.id_usuario
      LEFT JOIN
          suscripciones s ON u.id = s.id_usuario
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY
          p.average_rating DESC NULLS LAST, -- Ordenar por calificación promedio (los nulos al final)
          s.fecha_fin DESC; -- Luego por fecha de fin de suscripción
    `;

    const result = await db.query(query, queryParams);
    console.log("Datos de perfiles destacados obtenidos del backend:", result.rows); // Añadir este log
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los perfiles destacados:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});


// RUTA PÚBLICA: OBTENER TODAS LAS NACIONALIDADES ÚNICAS
router.get('/nacionalidades', async (req, res) => {
  try {
    const query = "SELECT DISTINCT nacionalidad FROM perfiles_usuario WHERE nacionalidad IS NOT NULL ORDER BY nacionalidad ASC";
    const result = await db.query(query);
    res.json(result.rows.map(row => row.nacionalidad));
  } catch (error) {
    console.error('Error al obtener las nacionalidades:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// RUTA PÚBLICA: OBTENER TODOS LOS PUESTOS ÚNICOS
router.get('/puestos', async (req, res) => {
  try {
    const query = "SELECT DISTINCT posicion_principal FROM perfiles_usuario WHERE posicion_principal IS NOT NULL ORDER BY posicion_principal ASC";
    const result = await db.query(query);
    res.json(result.rows.map(row => row.posicion_principal));
  } catch (error) {
    console.error('Error al obtener los puestos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


// --- RUTA PÚBLICA: OBTENER PERFIL DE USUARIO ---
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  // Validar que userId sea un número
  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número válido." });
  }

  const userIdNum = parseInt(userId, 10); // Convertir a número una vez validado

  try {
    const query = `
      SELECT u.*, COALESCE(p.foto_perfil_url, '/images/logos/logofp.webp') AS foto_perfil_url, p.telefono, p.nacionalidad, p.resumen_profesional, p.cv_url, p.posicion_principal, p.linkedin_url, p.instagram_url, p.youtube_url, p.transfermarkt_url, p.whatsapp_url, p.altura_cm, p.peso_kg, p.pie_dominante, p.fecha_de_nacimiento,
             p.average_rating, p.total_ratings, -- Añadir calificación al SELECT
             s.plan as subscription_plan,
             s.fecha_fin as subscription_end_date,
             s.estado as subscription_status
      FROM usuarios u
      LEFT JOIN perfiles_usuario p ON u.id = p.id_usuario
      LEFT JOIN suscripciones s ON u.id = s.id_usuario
      WHERE u.id = @userId;
    `;
    const result = await db.query(query, { userId: userIdNum }); // Usar userIdNum aquí

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userProfile = result.rows[0];

    res.json(userProfile);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// --- RUTA PARA REGISTRAR UNA VISTA DE PERFIL ---
router.post('/:userId/view', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      UPDATE usuarios
      SET profile_views = COALESCE(profile_views, 0) + 1
      WHERE id = @userId;
    `;
    await db.query(query, { userId });
    res.status(204).send(); // No content
  } catch (error) {
    // No enviar un error al cliente, solo registrarlo en el servidor
    // para no interrumpir la experiencia del usuario si esto falla.
    console.error(`Failed to record profile view for user ${userId}:`, error);
    res.status(500).send(); // Enviar una respuesta para cerrar la conexión
  }
});

// ... (Otras rutas existentes)

// --- RUTA PROTEGIDA: CALIFICAR UN PERFIL ---
router.post("/:profileId/rate", verificarToken, async (req, res) => {
  const { profileId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id; // Usuario autenticado realizando la calificación

  if (isNaN(parseInt(profileId, 10))) {
    return res.status(400).json({ message: "El ID de perfil no es válido." });
  }

  const profileIdNum = parseInt(profileId, 10);

  // No permitir que un usuario califique su propio perfil
  if (userId === profileIdNum) {
    return res
      .status(403)
      .json({ message: "No puedes calificar tu propio perfil." });
  }

  // Validar la calificación
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ message: "La calificación debe ser un número entre 1 y 5." });
  }

      try {
      // Registrar o actualizar la calificación del usuario para este perfil
      const upsertRatingQuery = `
          INSERT INTO profile_ratings (profile_id, user_id, rating)
          VALUES (@profileIdNum, @userId, @rating)
          ON CONFLICT (profile_id, user_id) DO UPDATE SET
              rating = EXCLUDED.rating,
              updated_at = CURRENT_TIMESTAMP
          RETURNING *;
      `;
      await db.query(upsertRatingQuery, { profileIdNum, userId, rating });
  
      // Actualizar las estadísticas de calificaciones en el perfil
      const updateProfileStatsQuery = `
        UPDATE perfiles_usuario
        SET average_rating = stats.avg_rating,
            total_ratings = stats.total_ratings
        FROM (
          SELECT profile_id, AVG(rating)::float AS avg_rating, COUNT(*) AS total_ratings
          FROM profile_ratings
          WHERE profile_id = @profileIdNum
          GROUP BY profile_id
        ) AS stats
        WHERE id_usuario = stats.profile_id;
      `;
      await db.query(updateProfileStatsQuery, { profileIdNum });
  
      const updatedProfileRatings = await db.query(
        `SELECT average_rating, total_ratings FROM perfiles_usuario WHERE id_usuario = @profileIdNum`,
        { profileIdNum }
      );

      if (updatedProfileRatings.rows.length === 0) {
        return res.status(404).json({ message: "Perfil no encontrado." });
      }
  
      res.status(200).json({
        message: "Perfil calificado exitosamente.",
        average_rating: updatedProfileRatings.rows[0].average_rating,
        total_ratings: updatedProfileRatings.rows[0].total_ratings,
      });
    } catch (error) {
      console.error("Error al calificar el perfil:", error);
      res.status(500).json({ message: "Error del servidor al calificar." });
    }
  });
module.exports = router;

// --- RUTA PROTEGIDA: ACTUALIZAR PERFIL DEL USUARIO AUTENTICADO ---
router.put(
  "/me",
  verificarToken,
  upload.single("foto_perfil"),
  async (req, res) => {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      telefono,
      nacionalidad,
      posicion_principal,
      resumen_profesional,
      cv_url,
      linkedin_url,
      instagram_url,
      youtube_url,
      transfermarkt_url,
      whatsapp_url,
      altura_cm,
      peso_kg,
      pie_dominante,
      fecha_de_nacimiento,
    } = req.body;

    let fotoPerfilUrl = null;

    try {
      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize(300, 300, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const key = `user-photos/profile-${userId}-${Date.now()}.webp`;

        fotoPerfilUrl = await uploadToS3(
          processedImageBuffer,
          key,
          "image/webp"
        );
      }

      const upsertQuery = `
        INSERT INTO perfiles_usuario (id_usuario, foto_perfil_url, telefono, nacionalidad, resumen_profesional, cv_url, posicion_principal, linkedin_url, instagram_url, youtube_url, transfermarkt_url, whatsapp_url, altura_cm, peso_kg, pie_dominante, fecha_de_nacimiento)
        VALUES (@userId, @fotoPerfilUrl, @telefono, @nacionalidad, @resumen_profesional, @cv_url, @posicion_principal, @linkedin_url, @instagram_url, @youtube_url, @transfermarkt_url, @whatsapp_url, @altura_cm, @peso_kg, @pie_dominante, @fecha_de_nacimiento)
        ON CONFLICT (id_usuario)
        DO UPDATE SET
          foto_perfil_url = COALESCE(@fotoPerfilUrl, perfiles_usuario.foto_perfil_url),
          telefono = @telefono,
          nacionalidad = @nacionalidad,
          resumen_profesional = @resumen_profesional,
          cv_url = @cv_url,
          posicion_principal = @posicion_principal,
          linkedin_url = @linkedin_url,
          instagram_url = @instagram_url,
          youtube_url = @youtube_url,
          transfermarkt_url = @transfermarkt_url,
          whatsapp_url = @whatsapp_url,
          altura_cm = @altura_cm,
          peso_kg = @peso_kg,
          pie_dominante = @pie_dominante,
          fecha_de_nacimiento = @fecha_de_nacimiento
        RETURNING *;
      `;

      await db.query(upsertQuery, {
        userId,
        fotoPerfilUrl,
        telefono,
        nacionalidad,
        resumen_profesional,
        cv_url,
        posicion_principal,
        linkedin_url,
        instagram_url,
        youtube_url,
        transfermarkt_url,
        whatsapp_url,
        altura_cm: altura_cm || null,
        peso_kg: peso_kg || null,
        pie_dominante,
        fecha_de_nacimiento: fecha_de_nacimiento || null,
      });

      const result = await db.query(
        "SELECT * FROM usuarios WHERE id = @userId",
        { userId }
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const updatedUser = result.rows[0];

      res.json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al actualizar el perfil." });
    }
  }
);

// --- RUTA PÚBLICA: OBTENER OFERTAS DE UN USUARIO ---
router.get("/:userId/offers", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const query = `
      SELECT id, titulo, descripcion, estado, fecha_publicacion
      FROM ofertas_laborales
      WHERE id_usuario_ofertante = @userId
      ORDER BY fecha_publicacion DESC;
    `;
    const result = await db.query(query, { userId: parseInt(userId, 10) });
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las ofertas del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las ofertas." });
  }
});

// --- Esquema de validación para videos ---
const videoSchema = z.object({
  title: z.string().min(3).max(100),
  youtube_url: z
    .string()
    .url({ message: "Por favor, introduce una URL de YouTube válida." }),
  position: z.preprocess(
    (val) => parseInt(val, 10),
    z
      .number()
      .min(1, "La posición debe ser entre 1 y 5")
      .max(5, "La posición debe ser entre 1 y 5")
  ),
});

// --- RUTA PÚBLICA: OBTENER VIDEOS DE UN USUARIO ---
// Public route
router.get("/:userId/videos", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const query = `
      SELECT id, user_id, title, youtube_url, cover_image_url, position
      FROM user_videos
      WHERE user_id = @userId
      ORDER BY position ASC;
    `;
    const result = await db.query(query, { userId });

    // Simplemente enviamos las filas directamente, ya que la URL de S3 es completa
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los videos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener los videos." });
  }
});

// --- RUTA PROTEGIDA: AÑADIR UN NUEVO VIDEO ---
router.post(
  "/videos",
  verificarToken,
  upload.single("cover_image"),
  validate(videoSchema),
  async (req, res) => {
    const user_id = req.user.id;
    const { title, youtube_url, position } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "La imagen de portada es obligatoria." });
    }

    try {
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize(800, 450)
        .webp({ quality: 85 })
        .toBuffer();

      const key = `video-covers/cover-${user_id}-${Date.now()}.webp`;

      const coverImageUrl = await uploadToS3(
        processedImageBuffer,
        key,
        "image/webp"
      );

      const translatedTitles = await translateText(title, ["es", "en"]);

      const insertQuery = `
        INSERT INTO user_videos (user_id, title, title_es, title_en, youtube_url, cover_image_url, position)
        VALUES (@user_id, @title, @title_es, @title_en, @youtube_url, @cover_image_url, @position)
        RETURNING *;
      `;
      const result = await db.query(insertQuery, {
        user_id,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
        youtube_url,
        cover_image_url: coverImageUrl,
        position,
      });

      const newVideo = result.rows[0];

      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error al añadir el video:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al añadir el video." });
    }
  }
);

// ... (Otras rutas sin cambios)

// --- RUTA PÚBLICA: OBTENER FOTOS DE UN USUARIO ---
// --- RUTA PÚBLICA: OBTENER FOTOS DE UN USUARIO ---
router.get("/:userId/photos", async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT id, url, title, title_es, title_en
      FROM user_photos
      WHERE user_id = @userId
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, { userId });

    // Enviamos las filas directamente, la URL de la foto ya es la de S3.
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las fotos del usuario:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener las fotos." });
  }
});

// --- RUTA PROTEGIDA: SUBIR UNA FOTO ---
router.post(
  "/:userId/photos",
  verificarToken,
  upload.single("photo"),
  async (req, res) => {
    const { userId } = req.params;
    const { title } = req.body;
    const requester = req.user;

    if (isNaN(parseInt(userId, 10))) {
      return res
        .status(400)
        .json({ message: "El ID de usuario debe ser un número." });
    }

    if (parseInt(userId, 10) !== requester.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para subir fotos a este perfil." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo." });
    }

    try {
      const processedImageBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize(1024)
        .webp({ quality: 80 })
        .toBuffer();

      const key = `user-photos/photo-${userId}-${Date.now()}.webp`;

      const photoUrl = await uploadToS3(
        processedImageBuffer,
        key,
        "image/webp"
      );

      const translatedTitles = await translateText(title);

      const insertQuery = `
        INSERT INTO user_photos (user_id, url, title, title_es, title_en)
        VALUES (@userId, @url, @title, @title_es, @title_en)
        RETURNING *;
      `;
      const result = await db.query(insertQuery, {
        userId,
        url: photoUrl,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
      });

      const newPhoto = result.rows[0];

      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error al subir la foto:", error);
      res.status(500).json({ message: "Error del servidor al subir la foto." });
    }
  }
);

// ... (El resto de las rutas como DELETE)

// --- RUTA PROTEGIDA: ELIMINAR UNA FOTO ---
router.delete("/:userId/photos/:photoId", verificarToken, async (req, res) => {
  const { userId, photoId } = req.params;
  const requester = req.user;

  if (parseInt(userId, 10) !== requester.id) {
    return res.status(403).json({
      message: "No tienes permiso para eliminar fotos de este perfil.",
    });
  }

  try {
    // Opcional: verificar que la foto existe y pertenece al usuario
    const photoResult = await db.query(
      "SELECT * FROM user_photos WHERE id = @photoId AND user_id = @userId",
      { photoId, userId }
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada." });
    }

    // Eliminar archivo del sistema de archivos
    const filename = photoResult.rows[0].url;
    const filePath = path.resolve(__dirname, "..", "uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar de la base de datos
    await db.query("DELETE FROM user_photos WHERE id = @photoId", { photoId });

    res.json({ message: "Foto eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar la foto:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la foto." });
  }
});

// --- RUTA PROTEGIDA: ACTUALIZAR UN VIDEO ---
router.put(
  "/videos/:videoId",
  verificarToken,
  upload.single("cover_image"),
  validate(videoSchema.partial()), // Permite actualizaciones parciales
  async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { title, youtube_url, position } = req.body;

    try {
      // Verificar que el video pertenece al usuario
      const videoResult = await db.query(
        "SELECT * FROM user_videos WHERE id = @videoId AND user_id = @userId",
        { videoId, userId }
      );

      if (videoResult.rows.length === 0) {
        return res.status(404).json({
          message: "Video no encontrado o no tienes permiso para editarlo.",
        });
      }

      let coverImageFilename = videoResult.rows[0].cover_image_url;

      if (req.file) {
        const processedImageBuffer = await sharp(req.file.buffer)
          .resize(800, 450)
          .webp({ quality: 85 })
          .toBuffer();

        const key = `video-covers/cover-${userId}-${Date.now()}.webp`;

        const newCoverImageUrl = await uploadToS3(
          processedImageBuffer,
          key,
          "image/webp"
        );

        // Eliminar la imagen de portada anterior si existe
        if (coverImageFilename) {
          // TODO: Implementar la eliminación de la imagen anterior de S3
        }
        coverImageFilename = newCoverImageUrl;
      }

      const translatedTitles = await translateText(title, ["es", "en"]);

      const updateQuery = `
        UPDATE user_videos
        SET 
          title = @title,
          title_es = @title_es,
          title_en = @title_en,
          youtube_url = @youtube_url,
          position = @position,
          cover_image_url = @coverImageFilename
        WHERE id = @videoId
        RETURNING *;
      `;

      const result = await db.query(updateQuery, {
        videoId,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
        youtube_url,
        position,
        coverImageFilename,
      });

      const updatedVideo = result.rows[0];

      res.json(updatedVideo);
    } catch (error) {
      console.error("Error al actualizar el video:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al actualizar el video." });
    }
  }
);

// --- RUTA PROTEGIDA: ELIMINAR UN VIDEO ---
router.delete("/videos/:videoId", verificarToken, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que el video pertenece al usuario
    const videoResult = await db.query(
      "SELECT * FROM user_videos WHERE id = @videoId AND user_id = @userId",
      { videoId, userId }
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({
        message: "Video no encontrado o no tienes permiso para eliminarlo.",
      });
    }

    // Eliminar la imagen de portada del sistema de archivos
    const coverImageFilename = videoResult.rows[0].cover_image_url;
    if (coverImageFilename) {
      const filePath = path.resolve(
        __dirname,
        "..",
        "uploads",
        coverImageFilename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar de la base de datos
    await db.query("DELETE FROM user_videos WHERE id = @videoId", { videoId });

    res.json({ message: "Video eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el video:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar el video." });
  }
});

module.exports = router;