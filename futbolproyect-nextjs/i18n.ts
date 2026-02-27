import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import FsBackend from 'i18next-fs-backend';
import ChainedBackend from 'i18next-chained-backend';

const isServer = typeof window === 'undefined';

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    backend: {
      backends: [
        FsBackend, // En el servidor, carga desde el sistema de archivos
        HttpBackend, // En el cliente, carga a través de http
      ],
      backendOptions: [
        {
          // Opciones para FsBackend (servidor)
          loadPath: './public/locales/{{lng}}/{{ns}}.json',
        },
        {
          // Opciones para HttpBackend (cliente)
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      ],
    },
    fallbackLng: 'es',
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

