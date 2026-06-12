import { getStateFromStore, restoreState, serialize, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

export const AUTOSAVE_KEY = 'autosave';

const AUTOSAVE_DEBOUNCE_MS = 500;

// Stores holding transient UI state or reference data, not game state.
const SKIP_STORES = ['notifications'];

// A single debounce shared across every store, so a burst of changes
// touching several stores still results in one save.
let timeout = null;

export const autosavePlugin = ({ store }) => {
    if (!supportsLocalStorage()) {
        return;
    }

    if (SKIP_STORES.includes(store.$id)) {
        return;
    }

    store.$subscribe(() => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            try {
                localStorage.set(AUTOSAVE_KEY, serialize(getStateFromStore()));
            } catch {
                // Autosave must never break gameplay.
            }
        }, AUTOSAVE_DEBOUNCE_MS);
    }, { detached: true });
};

export const restoreAutosave = async () => {
    if (!supportsLocalStorage()) {
        return false;
    }

    const data = localStorage.get(AUTOSAVE_KEY);

    if (!data) {
        return false;
    }

    try {
        await restoreState(deserialize(data));
        return true;
    } catch {
        return false;
    }
};
