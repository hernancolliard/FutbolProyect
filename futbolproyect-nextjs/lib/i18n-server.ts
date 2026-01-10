import fsPromises from 'fs/promises';
import path from 'path';

// Function to load translations from JSON files
export async function getTranslation(locale: string, namespace: string = 'translation') {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, `${namespace}.json`);
  try {
    const fileContents = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading translation for ${locale}/${namespace}:`, error);
    return {};
  }
}