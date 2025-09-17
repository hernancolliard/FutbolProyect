const { Translate } = require("@google-cloud/translate").v2;

// Esta inicialización usará automáticamente las credenciales
// si la variable de entorno GOOGLE_APPLICATION_CREDENTIALS está configurada.
const translate = new Translate();

/**
 * Traduce un texto a los idiomas objetivo.
 * @param {string} text - El texto a traducir.
 * @param {string[]} targetLanguages - Un array de códigos de idioma (ej. ['en', 'es']).
 * @returns {Promise<Object>} Un objeto con las traducciones, ej. { en: 'Hello', es: 'Hola' }.
 */
const translateText = async (text, targetLanguages = ["en", "es"]) => {
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
    // En caso de error, puedes decidir devolver nulos o lanzar el error.
    // Devolver nulos puede hacer la aplicación más resiliente.
    const errorTranslations = {};
    targetLanguages.forEach((lang) => {
      errorTranslations[lang] = text; // O `null` si prefieres no mostrar nada.
    });
    return errorTranslations;
  }
};

module.exports = { translateText };
