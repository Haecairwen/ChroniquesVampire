import migrator from 'Migrations';
import { setActivePinia, createPinia } from 'pinia';
import {
    SIGNATURE,
    defaultGameState,
    getStateFromStore,
    restoreState,
    serialize,
    deserialize,
 } from 'Libs/gameState';


vi.mock('Migrations', () => {
    return {
      __esModule: true,
      default: {
        migrate: vi.fn(),
      },
    };
});

const STATE = { 
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

const serializedDataProvider = () => { 
    return [
        ['foo', 'IgBmAG8AbwAiAA=='],
        [1,'MQA='],
        [true, 'dAByAHUAZQA='],
        [{foo: 'bar'}, 'ewAiAGYAbwBvACIAOgAiAGIAYQByACIAfQA='],
    ];
};

 describe('lib/gameState.js', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        migrator.migrate.mockImplementation((data) => data);
    });

    it('Has the expected signature.', () => {
        expect(SIGNATURE).toEqual(4);
    });

    it('Can return a default game state, or slices of it.', () => { 
        const expectedState = {
            ...STATE.actions,
            ...STATE.characters,
            ...STATE.marks,
            ...STATE.memories,
            ...STATE.resources,
            ...STATE.skills
        };

        const result = defaultGameState();
        expect(result).toEqual(expectedState);
    });

    it.each([
        ['foo', {}],
        ['actions', STATE.actions],
        ['characters', STATE.characters],
        ['marks', STATE.marks],
        ['memories', STATE.memories],
        ['resources', STATE.resources],
        ['skills', STATE.skills],
    ])('Can return a section of default state, or an empty dictionary if an invalid section is requested.', (section, expectedState) => {
        const result = defaultGameState(section);
        expect(result).toEqual(expectedState);
    })

    it('Can get state from the stores.', () => {
        const expected = {
            ...STATE.actions,
            ...STATE.characters,
            ...STATE.marks,
            ...STATE.memories,
            ...STATE.resources,
            ...STATE.skills,
            __SIGNATURE__: SIGNATURE
        };

        const result = getStateFromStore();

        expect(result).toEqual(expected);

    });

    it('Can restore state to the stores.', async () => {
        const data = {};

        await restoreState(data);

        expect(migrator.migrate).toHaveBeenCalled();

        expect(getStateFromStore()).toEqual({
            ...STATE.actions,
            ...STATE.characters,
            ...STATE.marks,
            ...STATE.memories,
            ...STATE.resources,
            ...STATE.skills,
            __SIGNATURE__: SIGNATURE,
        });
    });

    it('Can restore state to the stores, with existing data.', async () => {
        const data = {
          d6: 1,
          d10: 2,
          lastRoll: "3",
          currentPromptIdx: 4,
          prompts: [{page:5, count: 1}, {page:6, count:2}],
          maxMemories: 6,
          maxDiaryMemories: 5,
        };

        await restoreState(data);

        expect(migrator.migrate).toHaveBeenCalled();

        expect(getStateFromStore()).toEqual({
            ...STATE.actions,
            ...STATE.characters,
            ...STATE.marks,
            ...STATE.memories,
            ...STATE.resources,
            ...STATE.skills,
            ...data,
            __SIGNATURE__: SIGNATURE,
        });
    });

    it('Normalizes prompt page and count to integers when restoring.', async () => {
        await restoreState({
            prompts: [{page: '5', count: '2'}],
        });

        const { prompts } = getStateFromStore();

        expect(prompts).toEqual([{page: 5, count: 2}]);
    });

    it('Round-trips data containing non-Latin1 characters.', () => {
        const data = { entry: 'Un sombre récit — l’hiver de l’âme, écrit à Besançon.' };

        expect(deserialize(serialize(data))).toEqual(data);
    });

    it.each(serializedDataProvider())('Can serialize data into base64.', (input, output) => {
        const spyStringify = vi.spyOn(JSON, 'stringify');
        const spyBtoA = vi.spyOn(global, 'btoa');

        const result = serialize(input);

        expect(result).toEqual(output);
        expect(spyStringify).toHaveBeenCalledWith(input);
        expect(spyBtoA).toHaveBeenCalled();
    });

    it('Throws on failure to serialize.', () => {
        const input = 'foo';
        const spyStringify = vi.spyOn(JSON, 'stringify');
        const spyBtoA = vi.spyOn(global, 'btoa');

        spyStringify.mockImplementation(() => { 
            throw 'Fail';
        });

        expect(() => { 
            serialize(input);
        }).toThrow('Unable to serialize data structure.');

        expect(spyStringify).toHaveBeenCalledWith(input);
        expect(spyBtoA).not.toHaveBeenCalled();
    });

    it.each(serializedDataProvider())('Can deserialize data from base64.', (output, input) => { 
        const spyParse = vi.spyOn(JSON, 'parse');
        const spyAtoB = vi.spyOn(global, 'atob');

        const result = deserialize(input);

        expect(result).toEqual(output);
        expect(spyParse).toHaveBeenCalled();
        expect(spyAtoB).toHaveBeenCalledWith(input);
    });

    it('Throws on failure to deserialize.', () => {
        const spyParse = vi.spyOn(JSON, 'parse');
        const spyAtoB = vi.spyOn(global, 'atob');

        spyParse.mockImplementation(() => { 
            throw 'Fail';
        });

        expect(() => { 
            deserialize('foo');
        }).toThrow('Unable to parse deserialised data.');

        expect(spyParse).toHaveBeenCalled();
        expect(spyAtoB).toHaveBeenCalledWith('foo');
    });
 });