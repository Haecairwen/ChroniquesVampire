import { randomRange } from 'Libs/random';
import { defaultGameState } from 'Libs/gameState';
import entityFactory from 'Libs/entities/prompts';
import { findById } from 'Libs/entities';
import Vue from 'vue';

const state = {
    ...defaultGameState('actions'),
};

const getters = {
    die: (state,) => state.d10 - state.d6,
    currentRoll: (state, getters) => {
        if (isNaN(getters.die)) {
            return '?'
        } 

        return `${getters.die} (+${state.d10}, -${state.d6})`;
    },
    currentPrompt: (state) => state.prompts[state.currentPromptIdx] ?? {},
    journalEntries: (state) => state.prompts,
};

const mutations = {
    rollD6: (state) => state.d6 = randomRange(1, 6),
    setD6: (state, value) => state.d6 = value,
    setD10: (state, value) => state.d10 = value,
    rollD10: (state) => state.d10 = randomRange(1, 10),
    saveRoll: (state, roll) => state.lastRoll = roll,
    makePrompt: (state, prompt) => state.prompts.push(entityFactory({page: prompt, count: 0})),
    addPrompt: (state, prompt) => state.prompts.push(entityFactory(prompt)),
    setPrompts: (state, prompts) => state.prompts = prompts,
    removePrompt: (state, prompt) => {
        const found = findById(state.prompts, prompt.id);
        state.prompts.splice(found.idx, 1);
    },
    incrementPrompt: (state, prompt) => {
        const found = findById(state.prompts, prompt.id);
        Vue.set(found.entity, 'count', found.entity.count + 1)
    },
    decrementPrompt: (state, prompt) => {
        const found = findById(state.prompts, prompt.id);
        Vue.set(found.entity, 'count', found.entity.count - 1)
    },
    setPromptCount: (state, {prompt, count}) => {
        const found = findById(state.prompts, prompt.id);
        Vue.set(found.entity, 'count', count)
    },
    updatePromptEntry: (state, {prompt, entry}) => {
        const found = findById(state.prompts, prompt.id);
        Vue.set(found.entity, 'entry', entry);
    },
    setCurrentPromptIdx: (state, idx) => state.currentPromptIdx = idx,
}

const actions = {
    /**
     * Rolls d10 - d6 and resolves the next prompt (house rule):
     * - A positive result moves forward that many prompts, at visit 1.
     * - Zero or negative stays on the current prompt and advances the
     *   visit count, to a maximum of 3.
     * - Once at 3 visits, another non-positive roll moves forward one
     *   prompt, back at visit 1.
     */
     roll: ({commit, getters, state}) => {
        commit('saveRoll', getters.currentRoll);
        commit('rollD6');
        commit('rollD10');

        const die = getters.die;
        const current = getters.currentPrompt;
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

        var promptIdx = state.prompts.findIndex((prompt) => prompt.page === newPage);

        if (promptIdx === -1) {
            commit('addPrompt', entityFactory({page: newPage, count: newCount}));
            promptIdx = state.prompts.length - 1;
        } else {
            commit('setPromptCount', {prompt: state.prompts[promptIdx], count: newCount});
        }

        commit('setCurrentPromptIdx', promptIdx);
    },
    makePromptCurrent({commit, state}, prompt) {
        const found = findById(state.prompts, prompt.id);
        commit('setCurrentPromptIdx', found.idx);
    },
    removePrompt({commit, getters, state}, prompt) {
        const currentPrompt = getters.currentPrompt;

        commit('removePrompt', prompt);

        const found = findById(state.prompts, currentPrompt.id);

        commit('setCurrentPromptIdx', found.idx);
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};