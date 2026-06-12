import { autosavePlugin, restoreAutosave, AUTOSAVE_KEY } from 'Libs/autosave';
import { getStateFromStore, restoreState, serialize, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

vi.mock('Libs/gameState');

vi.mock('Libs/localStorage');

const buildPluginStore = (id = 'actions') => ({
  $id: id,
  $subscribe: vi.fn(),
});

describe('lib/autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    supportsLocalStorage.mockImplementation(() => true);
    serialize.mockImplementation(() => 'serialized-state');
    getStateFromStore.mockImplementation(() => ({ some: 'state' }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('autosavePlugin', () => {
    it('Does not subscribe when local storage is unsupported', () => {
      supportsLocalStorage.mockImplementation(() => false);

      const store = buildPluginStore();

      autosavePlugin({ store });

      expect(store.$subscribe).not.toHaveBeenCalled();
    });

    it('Does not subscribe to stores holding transient or reference data', () => {
      const store = buildPluginStore('notifications');

      autosavePlugin({ store });

      expect(store.$subscribe).not.toHaveBeenCalled();
    });

    it('Subscribes detached so unmounting components keeps the autosave alive', () => {
      const store = buildPluginStore();

      autosavePlugin({ store });

      expect(store.$subscribe).toHaveBeenCalledWith(expect.any(Function), { detached: true });
    });

    it('Saves the serialized game state after a change', () => {
      const store = buildPluginStore();

      autosavePlugin({ store });

      const handler = store.$subscribe.mock.calls[0][0];

      handler();

      expect(localStorage.set).not.toHaveBeenCalled();

      vi.runAllTimers();

      expect(getStateFromStore).toHaveBeenCalled();
      expect(localStorage.set).toHaveBeenCalledWith(AUTOSAVE_KEY, 'serialized-state');
    });

    it('Debounces rapid changes into a single save', () => {
      const store = buildPluginStore();

      autosavePlugin({ store });

      const handler = store.$subscribe.mock.calls[0][0];

      handler();
      handler();
      handler();

      vi.runAllTimers();

      expect(localStorage.set).toHaveBeenCalledTimes(1);
    });

    it('Debounces changes across different stores into a single save', () => {
      const actionsStore = buildPluginStore('actions');
      const memoriesStore = buildPluginStore('memories');

      autosavePlugin({ store: actionsStore });
      autosavePlugin({ store: memoriesStore });

      actionsStore.$subscribe.mock.calls[0][0]();
      memoriesStore.$subscribe.mock.calls[0][0]();

      vi.runAllTimers();

      expect(localStorage.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('restoreAutosave', () => {
    it('Returns false when local storage is unsupported', async () => {
      supportsLocalStorage.mockImplementation(() => false);

      await expect(restoreAutosave()).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });

    it('Returns false when there is no autosave', async () => {
      localStorage.get.mockImplementation(() => null);

      await expect(restoreAutosave()).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });

    it('Restores the game state from an autosave', async () => {
      localStorage.get.mockImplementation(() => 'saved-data');
      deserialize.mockImplementation(() => ({ restored: 'state' }));
      restoreState.mockImplementation(() => Promise.resolve());

      await expect(restoreAutosave()).resolves.toBe(true);

      expect(localStorage.get).toHaveBeenCalledWith(AUTOSAVE_KEY);
      expect(deserialize).toHaveBeenCalledWith('saved-data');
      expect(restoreState).toHaveBeenCalledWith({ restored: 'state' });
    });

    it('Returns false when the autosave is corrupt', async () => {
      localStorage.get.mockImplementation(() => 'corrupt');
      deserialize.mockImplementation(() => {
        throw 'Unable to parse deserialised data.';
      });

      await expect(restoreAutosave()).resolves.toBe(false);

      expect(restoreState).not.toHaveBeenCalled();
    });
  });
});
