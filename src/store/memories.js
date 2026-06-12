import { defineStore } from 'pinia';
import { defaultGameState } from 'Libs/defaultGameState';
import { memoryEntityFactory, eventEntityFactory } from 'Libs/entities/memories';
import { findById } from 'Libs/entities';

export const useMemoriesStore = defineStore('memories', {
    state: () => ({
        ...defaultGameState('memories'),
    }),
    getters: {
        active() {
            return this.activeMemories.length;
        },
        canAddMemories(state) {
            return this.active < state.maxMemories;
        },
        forgottenMemories: (state) => state.memories.filter(memory => memory.forgotten && memory.diary === '' && !memory.starred),
        activeMemories: (state) => state.memories.filter(memory => !memory.forgotten && memory.diary === '' && !memory.starred),
        starredMemories: (state) => state.memories.filter(memory => memory.starred),
        // Named eventsFor rather than events to avoid colliding with the
        // events state property in the flattened Pinia store namespace.
        eventsFor: (state) => (memory) => state.events.filter(event => event.memory === memory.id),
        hasEvents: (state) => (memory) => state.events.some(event => event.memory === memory.id),
    },
    actions: {
        addMemory(memory) {
            this.memories.push(memoryEntityFactory(memory));
        },
        setMemories(memories) {
            this.memories = memories;
        },
        updateMemory(memory) {
            const found = findById(this.memories, memory.id);
            this.memories[found.idx] = memoryEntityFactory(memory);
        },
        removeMemory(memory) {
            const found = findById(this.memories, memory.id);
            this.memories.splice(found.idx, 1);
        },
        toggleMemory(memory) {
            const found = findById(this.memories, memory.id);
            found.entity.forgotten = !found.entity.forgotten;
        },
        addEvent(event) {
            this.events.push(eventEntityFactory(event));
        },
        setEvents(events) {
            this.events = events;
        },
        updateEvent(event) {
            const found = findById(this.events, event.id);
            this.events[found.idx] = eventEntityFactory(event);
        },
        removeEvent(event) {
            const found = findById(this.events, event.id);
            this.events.splice(found.idx, 1);
        },
        diarise({memory, diary}) {
            const found = findById(this.memories, memory.id);
            found.entity.diary = diary.id;
        },
        undiarise(memory) {
            const found = findById(this.memories, memory.id);
            found.entity.diary = '';
        },
        starMemory(memory) {
            const found = findById(this.memories, memory.id);
            found.entity.starred = true;
            found.entity.diary = '';
        },
        setMaxMemories(value) {
            this.maxMemories = value;
        },
        incrementMaxMemories() {
            this.maxMemories += 1;
        },
        decrementMaxMemories() {
            if (this.maxMemories > 1) {
                this.maxMemories -= 1;
            }
        },
    },
});
