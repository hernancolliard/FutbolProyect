const express = require("express");
const router = express.Router();
const db = require("../db");
const { verificarToken } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { z } = require("zod");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { translateText } = require("../services/translationService");
const fs = require("fs");
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

// Configuración de Multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- RUTA PÚBLICA: OBTENER VIDEOS DE UN USUARIO ---
router.get("/:userId/videos", async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT id, user_id, title, youtube_url, cover_image_url, position
      FROM user_videos
      WHERE user_id = @userId
      ORDER BY position ASC;
    `;
    const result = await db.query(query, { userId });
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
      // 1. Verificar que el usuario no tenga ya 5 videos
      const countQuery = `SELECT COUNT(*) as video_count FROM user_videos WHERE user_id = @user_id`;
      const countResult = await db.query(countQuery, { user_id });
      if (countResult.rows[0].video_count >= 5) {
        return res
          .status(400)
          .json({ message: "No puedes añadir más de 5 videos." });
      }

      // 2. Verificar que la posición no esté ocupada
      const positionQuery = `SELECT id FROM user_videos WHERE user_id = @user_id AND position = @position`;
      const positionResult = await db.query(positionQuery, {
        user_id,
        position,
      });
      if (positionResult.rows.length > 0) {
        return res
          .status(400)
          .json({ message: `La posición ${position} ya está ocupada.` });
      }

      // 3. Procesar y guardar la imagen de portada
      const coverImageFilename = `cover-${user_id}-${Date.now()}.webp`;
      const outputPath = path.join("uploads", coverImageFilename);

      await sharp(req.file.buffer)
        .resize(800, 450) // Redimensionar a un aspect ratio 16:9
        .webp({ quality: 85 })
        .toFile(outputPath);

      // 4. Traducir el título
      const translatedTitles = await translateText(title, ["es", "en"]);

      // 5. Insertar en la base de datos
      const insertQuery = `
        INSERT INTO user_videos (user_id, title, title_es, title_en, youtube_url, cover_image_url, position)
        VALUES (@user_id, @title, @title_es, @title_en, @youtube_url, @cover_image_url, @position);
      `;
      await db.query(insertQuery, {
        user_id,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
        youtube_url,
        cover_image_url: coverImageFilename,
        position,
      });

      res.status(201).json({ message: "Video añadido con éxito." });
    } catch (error) {
      console.error("Error al añadir el video:", error);
      res
        .status(500)
        .json({ message: "Error del servidor al añadir el video." });
    }
  }
);

// --- RUTA PROTEGIDA: OBTENER EL PERFIL DE UN USUARIO ---
router.get("/:userId", verificarToken, async (req, res) => {
  const profileToViewId = parseInt(req.params.userId, 10);
  const requester = req.user;

  if (isNaN(profileToViewId)) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  try {
    let isAuthorized = false;

            if (requester.id === profileToViewId || requester.isadmin) {
      isAuthorized = true;
    } else if (requester.tipo_usuario === "ofertante") {
      const checkQuery = `
        SELECT 1 FROM postulaciones p
        JOIN ofertas_laborales o ON p.id_oferta = o.id
        WHERE p.id_usuario_postulante = @profileToViewId
          AND o.id_usuario_ofertante = @requesterId
      `;
      const result = await db.query(checkQuery, {
        profileToViewId,
        requesterId: requester.id,
      });
      if (result.rows.length > 0) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver este perfil." });
    }

    const profileQuery = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.tipo_usuario, p.*
      FROM usuarios u
      LEFT JOIN perfiles_usuario p ON u.id = p.id_usuario
      WHERE u.id = @profileToViewId
    `;
    const profileResult = await db.query(profileQuery, { profileToViewId });

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.json(profileResult.rows[0]);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
});

// --- RUTA PROTEGIDA: OBTENER POSTULACIONES DE UN USUARIO ---
router.get("/:userId/applications", verificarToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const requester = req.user;

  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  // Solo el propio usuario o un admin pueden ver las postulaciones
  if (requester.id !== userId && !requester.isadmin) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para ver estas postulaciones." });
  }

  try {
    const applicationsQuery = `
      SELECT p.id, p.mensaje_presentacion, p.fecha_postulacion, p.estado, o.titulo as oferta_titulo, o.id as oferta_id
      FROM postulaciones p
      JOIN ofertas_laborales o ON p.id_oferta = o.id
      WHERE p.id_usuario_postulante = @userId
      ORDER BY p.fecha_postulacion DESC
    `;
    const result = await db.query(applicationsQuery, { userId });
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener postulaciones:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener postulaciones." });
  }
});

// --- RUTA PROTEGIDA: OBTENER OFERTAS PUBLICADAS POR UN USUARIO (OFERTANTE) ---
router.get("/:userId/offers", verificarToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const requester = req.user;

  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ message: "El ID de usuario debe ser un número." });
  }

  // Solo el propio usuario (ofertante) o un admin pueden ver sus ofertas
  if (requester.id !== userId && !requester.isadmin) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para ver estas ofertas." });
  }

  try {
    const offersQuery = `
      SELECT id, titulo, descripcion, ubicacion, fecha_publicacion, estado
      FROM ofertas_laborales
      WHERE id_usuario_ofertante = @userId
      ORDER BY fecha_publicacion DESC
    `;
    const result = await db.query(offersQuery, { userId });
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res.status(500).json({ message: "Error del servidor al obtener ofertas." });
  }
});

// --- RUTA PROTEGIDA: ACTUALIZAR MI PROPIO PERFIL ---
router.put(
  "/me",
  verificarToken,
  upload.single("foto_perfil"),
  async (req, res) => {
    const id_usuario = req.user.id;
    const {
      nombre,
      apellido,
      telefono,
      nacionalidad,
      resumen_profesional,
      cv_url,
      posicion_principal,
      linkedin_url,
      instagram_url,
      youtube_url,
      transfermarkt_url,
      altura_cm,
      peso_kg,
      pie_dominante,
      fecha_de_nacimiento,
    } = req.body;

    let nueva_foto_filename = null;

    // Procesamiento de imagen si se sube una nueva
    if (req.file) {
      try {
        // Generar un nombre de archivo único con extensión .webp
        nueva_foto_filename = `foto_perfil-${Date.now()}.webp`;
        const outputPath = path.join("uploads", nueva_foto_filename);

        // Usar sharp para convertir la imagen a WebP y guardarla
        await sharp(req.file.buffer)
          .resize(800) // Opcional: redimensionar para estandarizar
          .webp({ quality: 80 }) // Convertir a WebP con calidad del 80%
          .toFile(outputPath);
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        // Es importante no continuar si la imagen falla
        return res
          .status(500)
          .json({ message: "Error al procesar la imagen." });
      }
    }

    try {
      // 1. Actualizar la tabla 'usuarios'
      const userUpdateQuery = `UPDATE usuarios SET nombre = @nombre, apellido = @apellido WHERE id = @id_usuario`;
      await db.query(userUpdateQuery, { nombre, apellido, id_usuario });

      // 2. Traducción de campos
      const [resumen_trans, posicion_trans, nacionalidad_trans, pie_dominante_trans] = await Promise.all([
        translateText(resumen_profesional),
        translateText(posicion_principal),
        translateText(nacionalidad),
        translateText(pie_dominante),
      ]);

      // 3. Actualizar o Insertar en 'perfiles_usuario'
      const checkProfileQuery = `SELECT id_usuario FROM perfiles_usuario WHERE id_usuario = @id_usuario`;
      const existingProfile = await db.query(checkProfileQuery, { id_usuario });

      let profileQuery = "";
      const profileParams = {
        id_usuario,
        telefono,
        nacionalidad,
        resumen_profesional,
        cv_url,
        posicion_principal,
        linkedin_url,
        instagram_url,
        youtube_url,
        transfermarkt_url,
        altura_cm,
        peso_kg,
        pie_dominante,
        fecha_de_nacimiento: fecha_de_nacimiento || null,
        resumen_profesional_es: resumen_trans.es,
        resumen_profesional_en: resumen_trans.en,
        posicion_principal_es: posicion_trans.es,
        posicion_principal_en: posicion_trans.en,
        nacionalidad_es: nacionalidad_trans.es,
        nacionalidad_en: nacionalidad_trans.en,
        pie_dominante_es: pie_dominante_trans.es,
        pie_dominante_en: pie_dominante_trans.en,
      };

      if (existingProfile.rows.length > 0) {
        let updateFields = [
          "telefono = @telefono",
          "nacionalidad = @nacionalidad",
          "resumen_profesional = @resumen_profesional",
          "cv_url = @cv_url",
          "posicion_principal = @posicion_principal",
          "linkedin_url = @linkedin_url",
          "instagram_url = @instagram_url",
          "youtube_url = @youtube_url",
          "transfermarkt_url = @transfermarkt_url",
          "altura_cm = @altura_cm",
          "peso_kg = @peso_kg",
          "pie_dominante = @pie_dominante",
          "fecha_de_nacimiento = @fecha_de_nacimiento",
          "resumen_profesional_es = @resumen_profesional_es",
          "resumen_profesional_en = @resumen_profesional_en",
          "posicion_principal_es = @posicion_principal_es",
          "posicion_principal_en = @posicion_principal_en",
          "nacionalidad_es = @nacionalidad_es",
          "nacionalidad_en = @nacionalidad_en",
          "pie_dominante_es = @pie_dominante_es",
          "pie_dominante_en = @pie_dominante_en",
        ];

        // Solo añadir la actualización de la foto si se ha procesado una nueva
        if (nueva_foto_filename) {
          updateFields.push("foto_perfil_url = @foto_perfil_url");
          profileParams.foto_perfil_url = nueva_foto_filename;
        }

        profileQuery = `UPDATE perfiles_usuario SET ${updateFields.join(
          ", "
        )} WHERE id_usuario = @id_usuario`;
      } else {
        // Si es un perfil nuevo, la foto puede ser null si no se subió
        profileParams.foto_perfil_url = nueva_foto_filename;
        profileQuery = `
        INSERT INTO perfiles_usuario (id_usuario, telefono, nacionalidad, resumen_profesional, cv_url, posicion_principal, linkedin_url, instagram_url, youtube_url, transfermarkt_url, altura_cm, peso_kg, pie_dominante, fecha_de_nacimiento, foto_perfil_url, resumen_profesional_es, resumen_profesional_en, posicion_principal_es, posicion_principal_en, nacionalidad_es, nacionalidad_en, pie_dominante_es, pie_dominante_en)
        VALUES (@id_usuario, @telefono, @nacionalidad, @resumen_profesional, @cv_url, @posicion_principal, @linkedin_url, @instagram_url, @youtube_url, @transfermarkt_url, @altura_cm, @peso_kg, @pie_dominante, @fecha_de_nacimiento, @foto_perfil_url, @resumen_profesional_es, @resumen_profesional_en, @posicion_principal_es, @posicion_principal_en, @nacionalidad_es, @nacionalidad_en, @pie_dominante_es, @pie_dominante_en);
      `;
      }

      await db.query(profileQuery, profileParams);
      res.status(200).json({ message: "Perfil actualizado correctamente." });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res.status(500).json({ message: "Error del servidor." });
    }
  }
);

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
      const photoFilename = `user-photo-${userId}-${Date.now()}.webp`;
      const outputPath = path.join("uploads", photoFilename);

      await sharp(req.file.buffer)
        .rotate() // Auto-rotate based on EXIF data
        .resize(1024)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const translatedTitles = await translateText(title);

      const insertQuery = `
        INSERT INTO user_photos (user_id, url, title, title_es, title_en)
        VALUES (@userId, @url, @title, @title_es, @title_en);
      `;
      await db.query(insertQuery, {
        userId,
        url: photoFilename,
        title,
        title_es: translatedTitles.es,
        title_en: translatedTitles.en,
      });

      res.status(201).json({ message: "Foto subida con éxito." });
    } catch (error) {
      console.error("Error al subir la foto:", error);
      res.status(500).json({ message: "Error del servidor al subir la foto." });
    }
  }
);

// --- RUTA PROTEGIDA: ELIMINAR UNA FOTO ---
router.delete("/:userId/photos/:photoId", verificarToken, async (req, res) => {
  const { userId, photoId } = req.params;
  const requester = req.user;

  if (parseInt(userId, 10) !== requester.id) {
    return res
      .status(403)
      .json({
        message: "No tienes permiso para eliminar fotos de este perfil.",
      });
  }

  try {
    // First, get the URL of the photo to delete the file
    const photoQuery =
      "SELECT url FROM user_photos WHERE id = @photoId AND user_id = @userId";
    const photoResult = await db.query(photoQuery, { photoId, userId });

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ message: "Foto no encontrada." });
    }

    const photoUrl = photoResult.rows[0].url;

    // Delete the file from the uploads folder
    const photoPath = path.join("uploads", photoUrl);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Delete the photo from the database
    const deleteQuery = "DELETE FROM user_photos WHERE id = @photoId";
    await db.query(deleteQuery, { photoId });

    res.status(200).json({ message: "Foto eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la foto:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar la foto." });
  }
});

module.exports = router;