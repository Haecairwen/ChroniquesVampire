import { setActivePinia, createPinia } from 'pinia';
import { usePromptTextsStore, PROMPT_TEXTS_KEY } from 'Stores/promptTexts';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

vi.mock('Libs/localStorage');

const SAMPLE = [
  '1a',
  'First prompt.',
  '',
  '1b',
  'Second visit.',
].join('\n');

describe('store/promptTexts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    supportsLocalStorage.mockImplementation(() => true);
    localStorage.get.mockImplementation(() => null);
  });

  it('Hydrates from its own local storage key', () => {
    localStorage.get.mockImplementation(() => ({ 1: { a: 'Stored.' } }));

    const store = usePromptTextsStore();

    expect(localStorage.get).toHaveBeenCalledWith(PROMPT_TEXTS_KEY);
    expect(store.hasTexts).toBe(true);
    expect(store.textFor(1, 1)).toEqual('Stored.');
  });

  it('Starts empty when local storage is unsupported', () => {
    supportsLocalStorage.mockImplementation(() => false);

    const store = usePromptTextsStore();

    expect(store.hasTexts).toBe(false);
    expect(localStorage.get).not.toHaveBeenCalled();
  });

  it('Imports prompt text and persists it', () => {
    const store = usePromptTextsStore();

    const { imported, warnings } = store.importFromText(SAMPLE);

    expect(imported).toEqual(2);
    expect(warnings).toEqual([]);
    expect(localStorage.set).toHaveBeenCalledWith(PROMPT_TEXTS_KEY, JSON.stringify({ 1: { a: 'First prompt.', b: 'Second visit.' } }));
    expect(store.textFor(1, 2)).toEqual('Second visit.');
  });

  it('Keeps the existing pack when an import finds nothing', () => {
    const store = usePromptTextsStore();

    store.importFromText(SAMPLE);

    const { imported, warnings } = store.importFromText('not prompts');

    expect(imported).toEqual(0);
    expect(warnings.length).toBeGreaterThan(0);
    expect(store.textFor(1, 1)).toEqual('First prompt.');
  });

  it.each([
    [1, 'a'],
    [2, 'b'],
    [3, 'c'],
    [0, 'a'],
    [7, 'c'],
    [undefined, 'a'],
  ])('Maps visit count %s to letter %s, clamped', (count, letter) => {
    const store = usePromptTextsStore();

    store.texts = { 9: { a: 'A', b: 'B', c: 'C' } };

    expect(store.textFor(9, count)).toEqual(letter.toUpperCase());
  });

  it('Returns an empty string for unknown prompts', () => {
    const store = usePromptTextsStore();

    expect(store.textFor(42, 1)).toEqual('');
  });
});
