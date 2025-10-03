const express = require("express");
const router = express.Router();
const db = require("../db");
const { verificarToken, popularRolUsuario } = require("../middleware/authMiddleware");
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

// --- RUTA PÚBLICA: OBTENER PERFIL DE USUARIO ---
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT *, 
             (SELECT url FROM user_photos WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as foto_perfil_url
      FROM usuarios u
      WHERE u.id = @userId;
    `;
    const result = await db.query(query, { userId });

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

      const query = `
        UPDATE usuarios
        SET 
          nombre = @nombre,
          apellido = @apellido,
          telefono = @telefono,
          nacionalidad = @nacionalidad,
          posicion_principal = @posicion_principal,
          resumen_profesional = @resumen_profesional,
          cv_url = @cv_url,
          linkedin_url = @linkedin_url,
          instagram_url = @instagram_url,
          youtube_url = @youtube_url,
          transfermarkt_url = @transfermarkt_url,
          altura_cm = @altura_cm,
          peso_kg = @peso_kg,
          pie_dominante = @pie_dominante,
          fecha_de_nacimiento = @fecha_de_nacimiento,
          foto_perfil_url = COALESCE(@fotoPerfilUrl, foto_perfil_url)
        WHERE id = @userId
        RETURNING *;
      `;

      const result = await db.query(query, {
        userId,
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
        altura_cm,
        peso_kg,
        pie_dominante,
        fecha_de_nacimiento,
        fotoPerfilUrl,
      });

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const updatedUser = result.rows[0];

      res.json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res.status(500).json({ message: "Error del servidor al actualizar el perfil." });
    }
  }
);

// --- RUTA PÚBLICA: OBTENER OFERTAS DE UN USUARIO ---
router.get("/:userId/offers", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número." });
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
router.get("/:userId/videos", async (req, res) => {
  const { userId } = req.params;

  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    const query = `
      SELECT id, user_id, title, youtube_url, cover_image_url, position
      FROM user_videos
      WHERE user_id = @userId
      ORDER BY position ASC;
    `;
    const result = await db.query(query, { userId });

    const videosWithFullUrls = result.rows.map((video) => ({
      ...video,
      cover_image_url: video.cover_image_url
        ? getFullUrl(req, `uploads/${video.cover_image_url}`)
        : null,
    }));

    res.json(videosWithFullUrls);
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

    const photosWithFullUrls = result.rows.map((photo) => ({
      ...photo,
      url: getFullUrl(req, `uploads/${photo.url}`),
    }));

    res.json(photosWithFullUrls);
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
      return res.status(400).json({ message: "El ID de usuario debe ser un número." });
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
router.delete(
  "/:userId/photos/:photoId",
  verificarToken,
  async (req, res) => {
    const { userId, photoId } = req.params;
    const requester = req.user;

    if (parseInt(userId, 10) !== requester.id) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar fotos de este perfil." });
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
      res.status(500).json({ message: "Error del servidor al eliminar la foto." });
    }
  }
);

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
        return res
          .status(404)
          .json({ message: "Video no encontrado o no tienes permiso para editarlo." });
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
      updatedVideo.cover_image_url = getFullUrl(req, `uploads/${updatedVideo.cover_image_url}`);

      res.json(updatedVideo);
    } catch (error) {
      console.error("Error al actualizar el video:", error);
      res.status(500).json({ message: "Error del servidor al actualizar el video." });
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
      return res
        .status(404)
        .json({ message: "Video no encontrado o no tienes permiso para eliminarlo." });
    }

    // Eliminar la imagen de portada del sistema de archivos
    const coverImageFilename = videoResult.rows[0].cover_image_url;
    if (coverImageFilename) {
      const filePath = path.resolve(__dirname, "..", "uploads", coverImageFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar de la base de datos
    await db.query("DELETE FROM user_videos WHERE id = @videoId", { videoId });

    res.json({ message: "Video eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el video:", error);
    res.status(500).json({ message: "Error del servidor al eliminar el video." });
  }
});

module.exports = router;
