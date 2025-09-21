const { Translate } = require("@google-cloud/translate").v2;

// Si hay una API key, la usamos. Si no, el cliente se crea vacío
// y la lógica de la función translateText lo manejará.
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

/**
 * Traduce un texto a los idiomas objetivo, pero solo si la API Key está disponible.
 * @param {string} text - El texto a traducir.
 * @param {string[]} targetLanguages - Un array de códigos de idioma (ej. ['en', 'es']).
 * @returns {Promise<Object>} Un objeto con las traducciones, ej. { en: 'Hello', es: 'Hola' }.
 */
const translateText = async (text, targetLanguages = ["en", "es"]) => {
  // Si no hay API key, no intentar traducir y devolver el texto original para cada idioma.
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    // console.warn("ADVERTENCIA: No se encontró la GOOGLE_TRANSLATE_API_KEY. El servicio de traducción está desactivado.");
    const translations = {};
    targetLanguages.forEach((lang) => {
      translations[lang] = text || null;
    });
    return translations;
  }

  if (!text) {
    // Si no hay texto, devuelve un objeto con valores nulos para evitar errores.
    const translations = {};
    targetLanguages.forEach((lang) => {
      translations[lang] = null;
    });
    return translations;
  }

  try {
    const translations = {};
    for (const lang of targetLanguages) {
      // El primer elemento del array de respuesta es la traducción.
      const [translation] = await translate.translate(text, lang);
      translations[lang] = translation;
    }
    return translations;
  } catch (error) {
    console.error("ERROR en el servicio de traducción:", error);
    // En caso de error con la API (ej. clave inválida), devolvemos el texto original.
    const errorTranslations = {};
    targetLanguages.forEach((lang) => {
      errorTranslations[lang] = text;
    });
    return errorTranslations;
  }
};

module.exports = { translateText };
