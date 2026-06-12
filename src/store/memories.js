import { defaultGameState } from 'Libs/gameState';
import { memoryEntityFactory, eventEntityFactory } from 'Libs/entities/memories';
import { findById } from 'Libs/entities';

const state = {
    ...defaultGameState('memories'),
};

const getters = {
    active: (state, getters) => getters.activeMemories.length,
    canAddMemories: (state, getters) => getters.active < state.maxMemories,
    forgottenMemories: (state) => state.memories.filter(memory => memory.forgotten && memory.diary === '' && !memory.starred),
    activeMemories: (state) => state.memories.filter(memory => !memory.forgotten && memory.diary === '' && !memory.starred),
    starredMemories: (state) => state.memories.filter(memory => memory.starred),
    events: (state) => (memory) => state.events.filter(event => event.memory === memory.id),
    hasEvents: (state) => (memory) => state.events.some(event => event.memory === memory.id),
};

const mutations = {
    addMemory: (state, memory) => state.memories.push(memoryEntityFactory(memory)),
    setMemories: (state, memories) => state.memories = memories,
    updateMemory: (state, memory) => {
        const found = findById(state.memories, memory.id);
        state.memories[found.idx] = memoryEntityFactory(memory);
    },
    removeMemory: (state, memory) => {
        const found = findById(state.memories, memory.id);
        state.memories.splice(found.idx, 1);
    },
    toggleMemory: (state, memory) => {
        const found = findById(state.memories, memory.id);
        found.entity.forgotten = !found.entity.forgotten;
    },
    addEvent: (state, event) => state.events.push(eventEntityFactory(event)),
    setEvents: (state, events) => state.events = events,
    updateEvent: (state, event) => {
        const found = findById(state.events, event.id);
        state.events[found.idx] = eventEntityFactory(event);
    },
    removeEvent: (state, event) => {
        const found = findById(state.events, event.id);
        state.events.splice(found.idx, 1);
    },
    diarise: (state, {memory, diary}) => {
        const found = findById(state.memories, memory.id);
        found.entity.diary = diary.id;
    },
    undiarise: (state, memory) => {
        const found = findById(state.memories, memory.id);
        found.entity.diary = '';
    },
    starMemory: (state, memory) => {
        const found = findById(state.memories, memory.id);
        found.entity.starred = true;
        found.entity.diary = '';
    },
    setMaxMemories: (state, value) => state.maxMemories = value,
    incrementMaxMemories: (state) => state.maxMemories += 1,
    decrementMaxMemories: (state) => {
        if (state.maxMemories > 1) {
            state.maxMemories -= 1;
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
};