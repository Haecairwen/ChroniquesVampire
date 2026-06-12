import { setActivePinia, createPinia } from 'pinia';
import { useMemoriesStore } from 'Stores/memories';

const memory = (overrides = {}) => ({
  id: 'm1',
  description: 'A memory',
  forgotten: false,
  diary: '',
  starred: false,
  ...overrides,
});

describe('store/memories', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMemoriesStore();
  });

  it('Starts with five memory slots and no memories', () => {
    expect(store.maxMemories).toEqual(5);
    expect(store.memories).toEqual([]);
    expect(store.active).toEqual(0);
    expect(store.canAddMemories).toBe(true);
  });

  it('Caps active memories at the slot count', () => {
    for (let i = 1; i <= 5; i++) {
      store.addMemory(memory({ id: `m${i}` }));
    }

    expect(store.active).toEqual(5);
    expect(store.canAddMemories).toBe(false);
  });

  it('Excludes forgotten, diarised, and starred memories from active slots', () => {
    store.addMemory(memory({ id: 'a' }));
    store.addMemory(memory({ id: 'b', forgotten: true }));
    store.addMemory(memory({ id: 'c', diary: 'd1' }));
    store.addMemory(memory({ id: 'd', starred: true }));

    expect(store.active).toEqual(1);
    expect(store.activeMemories.map(m => m.id)).toEqual(['a']);
    expect(store.forgottenMemories.map(m => m.id)).toEqual(['b']);
    expect(store.starredMemories.map(m => m.id)).toEqual(['d']);
  });

  it('Never drops below one memory slot', () => {
    store.setMaxMemories(2);

    store.decrementMaxMemories();
    store.decrementMaxMemories();
    store.decrementMaxMemories();

    expect(store.maxMemories).toEqual(1);
  });

  it('Gains and loses slots one at a time', () => {
    store.incrementMaxMemories();
    expect(store.maxMemories).toEqual(6);

    store.decrementMaxMemories();
    expect(store.maxMemories).toEqual(5);
  });

  it('Toggles a memory between forgotten and remembered', () => {
    store.addMemory(memory({ id: 'a' }));

    store.toggleMemory({ id: 'a' });
    expect(store.memories[0].forgotten).toBe(true);

    store.toggleMemory({ id: 'a' });
    expect(store.memories[0].forgotten).toBe(false);
  });

  it('Moves a memory in and out of the diary', () => {
    store.addMemory(memory({ id: 'a' }));

    store.diarise({ memory: { id: 'a' }, diary: { id: 'd1' } });
    expect(store.memories[0].diary).toEqual('d1');

    store.undiarise({ id: 'a' });
    expect(store.memories[0].diary).toEqual('');
  });

  it('Starring a memory pulls it out of the diary', () => {
    store.addMemory(memory({ id: 'a', diary: 'd1' }));

    store.starMemory({ id: 'a' });

    expect(store.memories[0].starred).toBe(true);
    expect(store.memories[0].diary).toEqual('');
  });

  it('Tracks events per memory', () => {
    store.addMemory(memory({ id: 'a' }));
    store.addEvent({ id: 'e1', memory: 'a', description: 'Event one' });
    store.addEvent({ id: 'e2', memory: 'other', description: 'Event two' });

    expect(store.eventsFor({ id: 'a' }).map(e => e.id)).toEqual(['e1']);
    expect(store.hasEvents({ id: 'a' })).toBe(true);
    expect(store.hasEvents({ id: 'none' })).toBe(false);

    store.removeEvent({ id: 'e1' });
    expect(store.hasEvents({ id: 'a' })).toBe(false);
  });

  it('Updates and removes memories by id', () => {
    store.addMemory(memory({ id: 'a', description: 'Before' }));

    store.updateMemory({ ...memory({ id: 'a' }), description: 'After' });
    expect(store.memories[0].description).toEqual('After');

    store.removeMemory({ id: 'a' });
    expect(store.memories).toEqual([]);
  });
});
