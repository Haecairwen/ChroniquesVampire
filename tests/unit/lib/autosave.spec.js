import { autosavePlugin, restoreAutosave, AUTOSAVE_KEY } from 'Libs/autosave';
import { getStateFromStore, restoreState, serialize, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

jest.mock('Libs/gameState');

jest.mock('Libs/localStorage');

describe('lib/autosave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    supportsLocalStorage.mockImplementation(() => true);
    serialize.mockImplementation(() => 'serialized-state');
    getStateFromStore.mockImplementation(() => ({ some: 'state' }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('autosavePlugin', () => {
    it('Does not subscribe when local storage is unsupported', () => {
      supportsLocalStorage.mockImplementation(() => false);

      const store = { subscribe: jest.fn() };

      autosavePlugin(store);

      expect(store.subscribe).not.toHaveBeenCalled();
    });

    it('Saves the serialized game state after a mutation', () => {
      const store = { subscribe: jest.fn() };

      autosavePlugin(store);

      const handler = store.subscribe.mock.calls[0][0];

      handler({ type: 'actions/rollD6' });

      expect(localStorage.set).not.toHaveBeenCalled();

      jest.runAllTimers();

      expect(getStateFromStore).toHaveBeenCalledWith(store);
      expect(localStorage.set).toHaveBeenCalledWith(AUTOSAVE_KEY, 'serialized-state');
    });

    it('Debounces rapid mutations into a single save', () => {
      const store = { subscribe: jest.fn() };

      autosavePlugin(store);

      const handler = store.subscribe.mock.calls[0][0];

      handler({ type: 'actions/rollD6' });
      handler({ type: 'actions/rollD10' });
      handler({ type: 'actions/addPrompt' });

      jest.runAllTimers();

      expect(localStorage.set).toHaveBeenCalledTimes(1);
    });

    it('Ignores notification mutations', () => {
      const store = { subscribe: jest.fn() };

      autosavePlugin(store);

      const handler = store.subscribe.mock.calls[0][0];

      handler({ type: 'notifications/show' });

      jest.runAllTimers();

      expect(localStorage.set).not.toHaveBeenCalled();
    });
  });

  describe('restoreAutosave', () => {
    it('Returns false when local storage is unsupported', async () => {
      supportsLocalStorage.mockImplementation(() => false);

      await expect(restoreAutosave({})).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });

    it('Returns false when there is no autosave', async () => {
      localStorage.get.mockImplementation(() => null);

      await expect(restoreAutosave({})).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });

    it('Restores the game state from an autosave', async () => {
      const store = {};

      localStorage.get.mockImplementation(() => 'saved-data');
      deserialize.mockImplementation(() => ({ restored: 'state' }));
      restoreState.mockImplementation(() => Promise.resolve());

      await expect(restoreAutosave(store)).resolves.toBe(true);

      expect(localStorage.get).toHaveBeenCalledWith(AUTOSAVE_KEY);
      expect(deserialize).toHaveBeenCalledWith('saved-data');
      expect(restoreState).toHaveBeenCalledWith(store, { restored: 'state' });
    });

    it('Returns false when the autosave is corrupt', async () => {
      localStorage.get.mockImplementation(() => 'corrupt');
      deserialize.mockImplementation(() => {
        throw 'Unable to parse deserialised data.';
      });

      await expect(restoreAutosave({})).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });
  });
});
