import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

// The interface theme is a device preference, not game state, so — like the
// locale — it lives in its own localStorage key and is never part of saves.
export const THEME_KEY = 'uiTheme';

// Each theme evokes a period of the vampire's unlife. Styling lives in
// tailwind.css under `[data-theme="..."]`; adding an era means adding a CSS
// block there and an id here (plus its `themes.<id>` label in the locales).
export const AVAILABLE_THEMES = ['gothic', 'victorian'];

export const DEFAULT_THEME = 'gothic';

export const currentTheme = () => {
    if (supportsLocalStorage()) {
        const stored = localStorage.get(THEME_KEY);

        if (AVAILABLE_THEMES.includes(stored)) {
            return stored;
        }
    }

    return DEFAULT_THEME;
};

export const setTheme = (theme) => {
    if (!AVAILABLE_THEMES.includes(theme)) {
        return;
    }

    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme;
    }

    if (supportsLocalStorage()) {
        try {
            localStorage.set(THEME_KEY, theme);
        } catch {
            // Persisting a preference must never break gameplay.
        }
    }
};

export const initTheme = () => {
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = currentTheme();
    }
};
