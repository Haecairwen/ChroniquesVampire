import migrator from 'Migrations';
import { defaultGameState } from 'Libs/defaultGameState';
import { useActionsStore } from 'Stores/actions';
import { useCharactersStore } from 'Stores/characters';
import { useMarksStore } from 'Stores/marks';
import { useMemoriesStore } from 'Stores/memories';
import { useResourcesStore } from 'Stores/resources';
import { useSkillsStore } from 'Stores/skills';

export { defaultGameState } from 'Libs/defaultGameState';

export const SIGNATURE = 4;

export const getStateFromStore = () => {
    const actions = useActionsStore();
    const characters = useCharactersStore();
    const marks = useMarksStore();
    const memories = useMemoriesStore();
    const resources = useResourcesStore();
    const skills = useSkillsStore();

    return {
        d6: actions.d6,
        d10: actions.d10,
        lastRoll: actions.lastRoll,
        prompts: actions.prompts,
        currentPromptIdx: actions.currentPromptIdx,
        characters: characters.characters,
        marks: marks.marks,
        memories: memories.memories,
        events: memories.events,
        maxMemories: memories.maxMemories,
        resources: resources.resources,
        diaries: resources.diaries,
        maxDiaryMemories: resources.maxDiaryMemories,
        skills: skills.skills,
        __SIGNATURE__: SIGNATURE,
    };
};

export const restoreState = async (data) => {
    data =  {
        ...defaultGameState(),
        ...data,
    };

    data = await migrator.migrate(data, SIGNATURE);

    const actions = useActionsStore();

    actions.saveRoll(data.lastRoll ?? '?');

    actions.d6 = data.d6 ?? NaN;

    actions.d10 = data.d10 ?? NaN;

    actions.setCurrentPromptIdx(data.currentPromptIdx ?? 0);

    const prompts = Array.isArray(data.prompts) ? data.prompts : [];

    prompts.forEach(prompt => {
        prompt.page = parseInt(prompt.page, 10);
        prompt.count = parseInt(prompt.count, 10);
    });

    actions.setPrompts(prompts);

    useCharactersStore().set(Array.isArray(data.characters) ? data.characters : []);

    useMarksStore().set(Array.isArray(data.marks) ? data.marks : []);

    const memories = useMemoriesStore();

    memories.setMemories(Array.isArray(data.memories) ? data.memories : []);

    memories.setEvents(Array.isArray(data.events) ? data.events : []);

    memories.setMaxMemories(data.maxMemories ?? 5);

    const resources = useResourcesStore();

    resources.setResources(Array.isArray(data.resources) ? data.resources : []);

    resources.setDiaries(Array.isArray(data.diaries) ? data.diaries : []);

    resources.setMaxDiaryMemories(data.maxDiaryMemories ?? 4);

    useSkillsStore().set(Array.isArray(data.skills) ? data.skills : []);
}

/**
 * Serializes the data for saving.
 *
 * @param {Object} data Data to serialise
 * @returns string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
 */
export const serialize = (data) => {
    let raw;

    try {
        raw = JSON.stringify(data);
    } catch {
        throw 'Unable to serialize data structure.';
    }

    const dataLength = raw.length;
    const codePoints = new Uint16Array(dataLength);

    for (let i = 0; i < dataLength; i++) {
        codePoints[i] = raw.charCodeAt(i);
    }

    return btoa(String.fromCharCode(...new Uint8Array(codePoints.buffer)));
};

/**
 * Desirailizes the data for consumption.
 *
 * @param {String} data Data to deserialise
 * @returns Object
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
 */
export const deserialize = (data) => {
    const raw = atob(data);
    const dataLength = raw.length;
    const codePoints = new Uint8Array(dataLength);

    for (let i = 0; i < dataLength; i++) {
        codePoints[i] = raw.charCodeAt(i);
    }

    try {
        return JSON.parse(String.fromCharCode(...new Uint16Array(codePoints.buffer)))
    } catch {
        throw 'Unable to parse deserialised data.'
    }
}
