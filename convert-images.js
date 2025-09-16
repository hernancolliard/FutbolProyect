
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagePaths = [
  'frontend/public/images',
  'frontend/src/images'
];

const supportedExtensions = ['.png', '.jpg', '.jpeg'];

async function convertImages() {
  console.log('Iniciando la conversión de imágenes a WebP...');

  for (const imgPath of imagePaths) {
    const fullPath = path.join(__dirname, imgPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Directorio no encontrado: ${fullPath}. Saltando.`);
      continue;
    }

    const files = fs.readdirSync(fullPath, { recursive: true });

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        const inputPath = path.join(fullPath, file);
        const outputPath = inputPath.replace(new RegExp(`${ext}$`), '.webp');

        try {
          await sharp(inputPath)
            .toFormat('webp')
            .toFile(outputPath);
          console.log(`Convertido: ${inputPath} -> ${outputPath}`);
        } catch (err) {
          console.error(`Error convirtiendo ${inputPath}:`, err);
        }
      }
    }
  }

  console.log('Conversión de imágenes completada.');
}

convertImages();
