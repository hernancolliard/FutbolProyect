import { promises as fs } from "fs";
import path from "path";

const translationsCache: Map<string, any> = new Map();

// Función para componentes de servidor
export async function getTranslation(locale?: string) {
  const lang = locale && locale.startsWith("en") ? "en" : "es";

  if (translationsCache.has(lang)) {
    const cached = translationsCache.get(lang);
    const t = (key: string) => cached[key] || key;
    return { t, translations: cached };
  }

  // --- CORRECCIÓN PARA RENDER ---
  // Intentamos primero la ruta estándar
  let localesPath = path.join(process.cwd(), "public", "locales");

  // Si no existe (caso Render), buscamos dentro de la carpeta del proyecto
  try {
    await fs.access(localesPath);
  } catch {
    // Ajuste: agregamos 'futbolproyect-nextjs' a la ruta
    localesPath = path.join(
      process.cwd(),
      "futbolproyect-nextjs",
      "public",
      "locales",
    );
  }

  const filePath = path.join(localesPath, `${lang}.json`);
  // -----------------------------

  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const translations = JSON.parse(fileContent);
    translationsCache.set(lang, translations);

    const t = (key: string) => {
      return translations[key] || key;
    };

    return { t, translations };
  } catch (error) {
    console.error(
      `Error cargando traducción para: ${lang} en la ruta: ${filePath}`,
      error,
    );
    if (lang !== "es") {
      return getTranslation("es");
    }
    const t = (key: string) => key;
    return { t, translations: {} };
  }
}
