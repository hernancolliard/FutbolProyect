import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esCommon from './public/locales/es/common.json';
import enCommon from './public/locales/en/common.json';

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
  .use(initReactI18next)
  .init({
    lng: getInitialLanguage(),
    resources: {
      es: { common: esCommon },
      en: { common: enCommon },
    },
    initImmediate: false,
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
