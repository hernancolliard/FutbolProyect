import { promises as fs } from 'fs';
import path from 'path';

const translationsCache: Map<string, any> = new Map();

// This function is designed to be used in Server Components.
export async function getTranslation(locale?: string) {
  const lang = locale && locale.startsWith('en') ? 'en' : 'es';

  if (translationsCache.has(lang)) {
    const cached = translationsCache.get(lang);
    const t = (key: string) => cached[key] || key;
    return { t, translations: cached };
  }

  const filePath = path.join(process.cwd(), 'public', 'locales', `${lang}.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent);
    translationsCache.set(lang, translations);

    // Return a t function similar to i18next
    const t = (key: string) => {
        return translations[key] || key;
    };

    return { t, translations };
  } catch (error) {
    console.error(`Could not load translation file for locale: ${lang}`, error);
    // Fallback to a default language or return a dummy t function
    if (lang !== 'es') {
      return getTranslation('es');
    }
    const t = (key: string) => key;
    return { t, translations: {} };
  }
}
