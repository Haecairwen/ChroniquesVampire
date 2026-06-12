import { createI18n } from 'vue-i18n';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';
import en from './locales/en.json';
import fr from './locales/fr.json';

// The locale is a device preference, not game state, so it lives in its
// own localStorage key and is never part of save files.
export const LOCALE_KEY = 'locale';

export const AVAILABLE_LOCALES = ['en', 'fr'];

const initialLocale = () => {
    if (supportsLocalStorage()) {
        const stored = localStorage.get(LOCALE_KEY);

        if (AVAILABLE_LOCALES.includes(stored)) {
            return stored;
        }
    }

    if (typeof navigator !== 'undefined' && (navigator.language ?? '').toLowerCase().startsWith('fr')) {
        return 'fr';
    }

    return 'en';
};

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale(),
    fallbackLocale: 'en',
    messages: { en, fr },
});

export const currentLocale = () => i18n.global.locale.value;

export const setLocale = (locale) => {
    if (!AVAILABLE_LOCALES.includes(locale)) {
        return;
    }

    i18n.global.locale.value = locale;

    if (supportsLocalStorage()) {
        try {
            localStorage.set(LOCALE_KEY, locale);
        } catch {
            // Persisting a preference must never break gameplay.
        }
    }
};

export default i18n;
