import { defineStore } from 'pinia';
import { randomRange } from 'Libs/random';
import { defaultGameState } from 'Libs/defaultGameState';
import entityFactory from 'Libs/entities/prompts';
import { findById } from 'Libs/entities';

export const useActionsStore = defineStore('actions', {
    state: () => ({
        ...defaultGameState('actions'),
    }),
    getters: {
        die: (state) => state.d10 - state.d6,
        currentRoll() {
            if (isNaN(this.die)) {
                return '?'
            }

            return `${this.die} (+${this.d10}, -${this.d6})`;
        },
        currentPrompt: (state) => state.prompts[state.currentPromptIdx] ?? {},
        journalEntries: (state) => state.prompts,
    },
    actions: {
        rollD6() {
            this.d6 = randomRange(1, 6);
        },
        rollD10() {
            this.d10 = randomRange(1, 10);
        },
        saveRoll(roll) {
            this.lastRoll = roll;
        },
        makePrompt(prompt) {
            this.prompts.push(entityFactory({page: prompt, count: 0}));
        },
        addPrompt(prompt) {
            this.prompts.push(entityFactory(prompt));
        },
        setPrompts(prompts) {
            this.prompts = prompts;
        },
        incrementPrompt(prompt) {
            const found = findById(this.prompts, prompt.id);
            found.entity.count += 1;
        },
        decrementPrompt(prompt) {
            const found = findById(this.prompts, prompt.id);
            found.entity.count -= 1;
        },
        setPromptCount({prompt, count}) {
            const found = findById(this.prompts, prompt.id);
            found.entity.count = count;
        },
        updatePromptEntry({prompt, entry}) {
            const found = findById(this.prompts, prompt.id);
            found.entity.entry = entry;
        },
        setCurrentPromptIdx(idx) {
            this.currentPromptIdx = idx;
        },
        /**
         * Rolls d10 - d6 and resolves the next prompt (house rule):
         * - A positive result moves forward that many prompts, at visit 1.
         * - Zero or negative stays on the current prompt and advances the
         *   visit count, to a maximum of 3.
         * - Once at 3 visits, another non-positive roll moves forward one
         *   prompt, back at visit 1.
         */
        roll() {
            this.saveRoll(this.currentRoll);
            this.rollD6();
            this.rollD10();

            const die = this.die;
            const current = this.currentPrompt;
            const currentPage = current.page || 1;
            const currentCount = current.count || 1;

            var newPage;
            var newCount;

            if (die > 0) {
                newPage = currentPage + die;
                newCount = 1;
            } else if (currentCount < 3) {
                newPage = currentPage;
                newCount = currentCount + 1;
            } else {
                newPage = currentPage + 1;
                newCount = 1;
            }

            var promptIdx = this.prompts.findIndex((prompt) => prompt.page === newPage);

            if (promptIdx === -1) {
                this.addPrompt(entityFactory({page: newPage, count: newCount}));
                promptIdx = this.prompts.length - 1;
            } else {
                this.setPromptCount({prompt: this.prompts[promptIdx], count: newCount});
            }

            this.setCurrentPromptIdx(promptIdx);
        },
        makePromptCurrent(prompt) {
            const found = findById(this.prompts, prompt.id);
            this.setCurrentPromptIdx(found.idx);
        },
        removePrompt(prompt) {
            const currentPrompt = this.currentPrompt;

            const removed = findById(this.prompts, prompt.id);
            this.prompts.splice(removed.idx, 1);

            const found = findById(this.prompts, currentPrompt.id);
            this.setCurrentPromptIdx(found.idx);
        },
    },
});
