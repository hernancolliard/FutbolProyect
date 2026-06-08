import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// We no longer use filesystem or chained backends; the client and server
// both load translations via HTTP from the public folder. This avoids
// pulling in `node:fs` during the webpack build.

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'es';
  }

  try {
    const savedLanguage =
      window.localStorage.getItem('i18nextLng') ||
      window.localStorage.getItem('language');

    return savedLanguage?.startsWith('en') ? 'en' : 'es';
  } catch {
    return 'es';
  }
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    nonExplicitSupportedLngs: true,
    debug: false, // Desactivado para producción
    interpolation: {
      escapeValue: false, // React ya escapa los valores
    },
    ns: ['common'],
    defaultNS: 'common',
    react: {
      useSuspense: false, // Importante para evitar que el cliente espere
    },
  });

export default i18n;
