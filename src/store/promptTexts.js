import { defineStore } from 'pinia';
import { parsePromptText, VISIT_LETTERS } from 'Libs/promptTextParser';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

// Prompt texts are reference data imported from the player's own copy of
// the book. They live in their own localStorage key, outside game saves,
// so save files stay small and portable.
export const PROMPT_TEXTS_KEY = 'prompt-texts';

const hydrate = () => {
    if (!supportsLocalStorage()) {
        return {};
    }

    const stored = localStorage.get(PROMPT_TEXTS_KEY);

    return (stored && typeof stored === 'object') ? stored : {};
};

export const usePromptTextsStore = defineStore('promptTexts', {
    state: () => ({
        texts: hydrate(),
    }),
    getters: {
        hasTexts: (state) => Object.keys(state.texts).length > 0,
        textFor: (state) => (page, count) => {
            const letter = VISIT_LETTERS[Math.min(Math.max(count || 1, 1), VISIT_LETTERS.length) - 1];

            return state.texts[page]?.[letter] ?? '';
        },
    },
    actions: {
        importFromText(raw) {
            const { texts, imported, warnings } = parsePromptText(raw);

            if (imported > 0) {
                this.texts = texts;
                this.persist();
            }

            return { imported, warnings };
        },
        persist() {
            if (!supportsLocalStorage()) {
                return;
            }

            try {
                localStorage.set(PROMPT_TEXTS_KEY, JSON.stringify({ ...this.texts }));
            } catch {
                // Persisting reference data must never break gameplay.
            }
        },
    },
});
