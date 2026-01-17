import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // Import the backend to load translations

console.log('i18n.ts: Initializing i18next with backend');
i18n
  .use(Backend) // Use the backend to load translations
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', // default language
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}.json', // Path to your translation files in public folder
    },
  });

export default i18n;
