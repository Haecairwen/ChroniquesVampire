import { defineStore } from 'pinia';
import { defaultGameState } from 'Libs/defaultGameState';
import { resourceEntityFactory, diaryEntityFactory } from 'Libs/entities/resources';
import { findById } from 'Libs/entities';
import { useMemoriesStore } from 'Stores/memories';

const byLostThenName = (a, b) => {
    // If a is not lost, move it up the array.
    if (a.lost && !b.lost) {
        return 1;
    }

    //If a is lost, move it down the array.
    if (!a.lost && b.lost) {
        return -1;
    }

    // Finally, sort alphabetically.
    return a.name.localeCompare(b.name);
};

export const useResourcesStore = defineStore('resources', {
    state: () => ({
        ...defaultGameState('resources'),
    }),
    getters: {
        // Named sorted* rather than resources/diaries to avoid colliding
        // with the state properties in the flattened Pinia store namespace.
        sortedResources: (state) => [...state.resources].sort(byLostThenName),
        sortedDiaries: (state) => [...state.diaries].sort(byLostThenName),
        diary: (state) => state.diaries.filter(diary => !diary.lost)[0] || null,
        lostDiaries: (state) => state.diaries.filter(diary => diary.lost),
        hasDiary() {
            return this.diary !== null;
        },
        memories() {
            const memoriesStore = useMemoriesStore();

            return memoriesStore.memories.filter(memory => {
                return memory.diary === this.diary.id;
            });
        },
        activeMemories() {
            return this.memories.filter(memory => !memory.forgotten);
        },
        forgottenMemories() {
            return this.memories.filter(memory => memory.forgotten);
        },
        isDiaryFull(state) {
            return this.memories.length >= state.maxDiaryMemories;
        },
    },
    actions: {
        addResource(resource) {
            this.resources.push(resourceEntityFactory(resource));
        },
        setResources(resources) {
            this.resources = resources;
        },
        updateResource(updated) {
            const found = findById(this.resources, updated.id);
            this.resources[found.idx] = resourceEntityFactory(updated);
        },
        removeResource(resource) {
            const found = findById(this.resources, resource.id);
            this.resources.splice(found.idx, 1);
        },
        toggleResource(resource) {
            const found = findById(this.resources, resource.id);
            found.entity.lost = !found.entity.lost;
        },
        addDiary(diary) {
            this.diaries.push(diaryEntityFactory(diary));
        },
        updateDiary(updated) {
            const found = findById(this.diaries, updated.id);
            this.diaries[found.idx] = diaryEntityFactory(updated);
        },
        setDiaries(diaries) {
            this.diaries = diaries;
        },
        removeDiary(diary) {
            const found = findById(this.diaries, diary.id);
            this.diaries.splice(found.idx, 1);
        },
        toggleDiary(diary) {
            const found = findById(this.diaries, diary.id);
            found.entity.lost = !found.entity.lost;
        },
        setMaxDiaryMemories(value) {
            this.maxDiaryMemories = value;
        },
        incrementMaxDiaryMemories() {
            this.maxDiaryMemories += 1;
        },
        decrementMaxDiaryMemories() {
            if (this.maxDiaryMemories > 1) {
                this.maxDiaryMemories -= 1;
            }
        },
    },
});
