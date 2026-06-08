'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; // Adjust path to your i18n config
import { ReactNode, useEffect } from 'react';

interface I18nProviderProps {
    children: ReactNode;
}

const I18nProvider = ({ children }: I18nProviderProps) => {
    useEffect(() => {
        const syncLanguage = (language: string) => {
            const normalizedLanguage = language?.startsWith('en') ? 'en' : 'es';

            document.documentElement.lang = normalizedLanguage;

            try {
                window.localStorage.setItem('i18nextLng', normalizedLanguage);
            } catch {
                // Ignore storage failures so language switching still works.
            }
        };

        syncLanguage(i18n.language || 'es');
        i18n.on('languageChanged', syncLanguage);

        return () => {
            i18n.off('languageChanged', syncLanguage);
        };
    }, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
