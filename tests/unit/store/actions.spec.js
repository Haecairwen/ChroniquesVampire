import { setActivePinia, createPinia } from 'pinia';
import { useActionsStore } from 'Stores/actions';
import { randomRange } from 'Libs/random';

vi.mock('Libs/random');

const buildStore = (state = {}) => {
  setActivePinia(createPinia());

  const store = useActionsStore();

  store.$patch((current) => Object.assign(current, {
    d6: NaN,
    d10: NaN,
    lastRoll: '?',
    currentPromptIdx: 0,
    prompts: [],
    ...state,
  }));

  return store;
};

// The roll action rolls d6 first, then d10.
const mockDice = (d6, d10) => {
  randomRange
    .mockReturnValueOnce(d6)
    .mockReturnValueOnce(d10);
};

describe('store/actions roll', () => {
  it('Moves forward by the die result on a positive roll, at visit 1', () => {
    const store = buildStore({
      prompts: [{ id: 'a', page: 3, count: 2, entry: '', text: '' }],
      currentPromptIdx: 0,
    });

    mockDice(2, 5); // die = +3

    store.roll();

    const current = store.currentPrompt;

    expect(current.page).toEqual(6);
    expect(current.count).toEqual(1);
  });

  it('Starts from prompt 1 when no prompt exists yet', () => {
    const store = buildStore();

    mockDice(1, 5); // die = +4

    store.roll();

    const current = store.currentPrompt;

    expect(current.page).toEqual(5);
    expect(current.count).toEqual(1);
  });

  it('Stays on the current prompt and advances the visit count on a non-positive roll', () => {
    const store = buildStore({
      prompts: [{ id: 'a', page: 3, count: 1, entry: '', text: '' }],
      currentPromptIdx: 0,
    });

    mockDice(4, 2); // die = -2

    store.roll();

    const current = store.currentPrompt;

    expect(current.page).toEqual(3);
    expect(current.count).toEqual(2);
  });

  it('Moves forward one prompt after a non-positive roll on the third visit', () => {
    const store = buildStore({
      prompts: [{ id: 'a', page: 3, count: 3, entry: '', text: '' }],
      currentPromptIdx: 0,
    });

    mockDice(6, 1); // die = -5

    store.roll();

    const current = store.currentPrompt;

    expect(current.page).toEqual(4);
    expect(current.count).toEqual(1);
  });

  it('Reuses an existing prompt when moving onto its page', () => {
    const store = buildStore({
      prompts: [
        { id: 'a', page: 3, count: 3, entry: 'old entry', text: '' },
        { id: 'b', page: 4, count: 2, entry: 'kept entry', text: '' },
      ],
      currentPromptIdx: 0,
    });

    mockDice(5, 5); // die = 0, third visit exhausted -> page 4

    store.roll();

    const current = store.currentPrompt;
    const prompts = store.journalEntries;

    expect(prompts.length).toEqual(2);
    expect(current.id).toEqual('b');
    expect(current.page).toEqual(4);
    expect(current.count).toEqual(1);
    expect(current.entry).toEqual('kept entry');
  });

  it('Saves the previous roll before rolling', () => {
    const store = buildStore({
      d6: 2,
      d10: 5,
      prompts: [{ id: 'a', page: 3, count: 1, entry: '', text: '' }],
      currentPromptIdx: 0,
    });

    mockDice(1, 1);

    store.roll();

    expect(store.lastRoll).toEqual('3 (+5, -2)');
  });
});
