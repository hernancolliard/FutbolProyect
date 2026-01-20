import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // Import the backend to load translations

console.log('i18n.ts: Initializing i18next with backend');
i18n
  .use(Backend) // Use the backend to load translations
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', // default language
    debug: true, // Cambiar a true para ver logs de i18next
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/locales/{{lng}}/common.json`, // Path to your translation files in public folder
    },
  }, (err, t) => {
    if (err) {
      console.error('Error al inicializar i18next:', err);
    } else {
      console.log('i18next inicializado. Idioma actual:', i18n.language);
      console.log('Recursos cargados para "es":', i18n.hasResourceBundle('es', 'common'));
      console.log('Recursos cargados para "en":', i18n.hasResourceBundle('en', 'common'));
    }
  });

export default i18n;
