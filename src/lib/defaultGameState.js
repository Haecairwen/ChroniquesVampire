export const defaultGameState = (section) => {
    const state = {
        actions: {
            d6: NaN,
            d10: NaN,
            lastRoll: '?',
            currentPromptIdx: 0,
            prompts: []
        },
        characters: {
            characters: []
        },
        marks: {
            marks: [],
        },
        memories: {
            memories: [],
            events: [],
            maxMemories: 5,
        },
        skills: {
            skills: []
        },
        resources: {
            resources: [],
            diaries: [],
            maxDiaryMemories: 4,
        },
    };

    if (section) {
        return {
            ...state[section] ?? {}
        }
    }

    return {
        ...state.actions,
        ...state.characters,
        ...state.marks,
        ...state.memories,
        ...state.resources,
        ...state.skills
    };
}
