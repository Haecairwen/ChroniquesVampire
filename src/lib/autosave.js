import { getStateFromStore, restoreState, serialize, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

export const AUTOSAVE_KEY = 'autosave';

const AUTOSAVE_DEBOUNCE_MS = 500;

export const autosavePlugin = (store) => {
    if (!supportsLocalStorage()) {
        return;
    }

    let timeout = null;

    store.subscribe((mutation) => {
        // Notifications are transient UI state, not game state.
        if (mutation.type.startsWith('notifications/')) {
            return;
        }

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            try {
                localStorage.set(AUTOSAVE_KEY, serialize(getStateFromStore(store)));
            } catch (err) {
                // Autosave must never break gameplay.
            }
        }, AUTOSAVE_DEBOUNCE_MS);
    });
};

export const restoreAutosave = async (store) => {
    if (!supportsLocalStorage()) {
        return false;
    }

    const data = localStorage.get(AUTOSAVE_KEY);

    if (!data) {
        return false;
    }

    try {
        await restoreState(store, deserialize(data));
        return true;
    } catch (err) {
        return false;
    }
};
