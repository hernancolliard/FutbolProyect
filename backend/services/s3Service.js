
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

// --- Configuración del cliente de S3 ---
// Las credenciales y la región se toman automáticamente de las variables de entorno:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
const s3Client = new S3Client({});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Sube un buffer de archivo a un bucket de S3.
 * @param {Buffer} fileBuffer - El buffer del archivo a subir.
 * @param {string} key - El nombre/ruta del archivo en S3 (e.g., "offers/image.webp").
 * @param {string} contentType - El tipo de contenido del archivo (e.g., "image/webp").
 * @returns {Promise<string>} La URL pública del objeto subido.
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  if (!BUCKET_NAME) {
    throw new Error("La variable de entorno S3_BUCKET_NAME no está configurada.");
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construir la URL pública del objeto
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error(`Error al subir el archivo ${key} a S3:`, error);
    throw error;
  }
};

module.exports = { uploadToS3 };
