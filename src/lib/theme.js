import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

// The theme is a device preference, not game state, so it lives in its
// own localStorage key and is never part of save files.
export const THEME_KEY = 'theme';

export const AVAILABLE_THEMES = ['gothic', 'baroque', 'nocturne', 'cathedral'];

const DEFAULT_THEME = 'gothic';

const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
};

export const currentTheme = () => document.documentElement.dataset.theme || DEFAULT_THEME;

export const initTheme = () => {
    let theme = DEFAULT_THEME;

    if (supportsLocalStorage()) {
        const stored = localStorage.get(THEME_KEY);

        if (AVAILABLE_THEMES.includes(stored)) {
            theme = stored;
        }
    }

    apply(theme);

    return theme;
};

export const setTheme = (theme) => {
    if (!AVAILABLE_THEMES.includes(theme)) {
        return;
    }

    apply(theme);

    if (supportsLocalStorage()) {
        try {
            localStorage.set(THEME_KEY, theme);
        } catch {
            // Persisting a preference must never break gameplay.
        }
    }
};
