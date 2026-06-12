import { setActivePinia, createPinia } from 'pinia';
import { useResourcesStore } from 'Stores/resources';
import { useMemoriesStore } from 'Stores/memories';

const resource = (overrides = {}) => ({
  id: 'r1',
  name: 'A resource',
  stationary: false,
  lost: false,
  ...overrides,
});

const diary = (overrides = {}) => ({
  id: 'd1',
  name: 'A diary',
  lost: false,
  ...overrides,
});

describe('store/resources', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useResourcesStore();
  });

  it('Starts with four diary memory slots', () => {
    expect(store.maxDiaryMemories).toEqual(4);
    expect(store.hasDiary).toBe(false);
    expect(store.diary).toBeNull();
  });

  it('Sorts resources with lost ones last, then alphabetically', () => {
    store.addResource(resource({ id: 'a', name: 'Castle', lost: true }));
    store.addResource(resource({ id: 'b', name: 'Brooch' }));
    store.addResource(resource({ id: 'c', name: 'Atlas' }));

    expect(store.sortedResources.map(r => r.name)).toEqual(['Atlas', 'Brooch', 'Castle']);
  });

  it('Treats the first unlost diary as the active diary', () => {
    store.addDiary(diary({ id: 'd1', lost: true }));
    store.addDiary(diary({ id: 'd2' }));

    expect(store.hasDiary).toBe(true);
    expect(store.diary.id).toEqual('d2');
    expect(store.lostDiaries.map(d => d.id)).toEqual(['d1']);
  });

  it('Reports the diary as full once its memories hit capacity', () => {
    store.addDiary(diary({ id: 'd1' }));
    store.setMaxDiaryMemories(2);

    const memories = useMemoriesStore();
    memories.addMemory({ id: 'm1', description: '', forgotten: false, diary: 'd1', starred: false });
    expect(store.isDiaryFull).toBe(false);

    memories.addMemory({ id: 'm2', description: '', forgotten: false, diary: 'd1', starred: false });
    expect(store.isDiaryFull).toBe(true);

    expect(store.memories.map(m => m.id)).toEqual(['m1', 'm2']);
  });

  it('Partitions diary memories into active and forgotten', () => {
    store.addDiary(diary({ id: 'd1' }));

    const memories = useMemoriesStore();
    memories.addMemory({ id: 'm1', description: '', forgotten: false, diary: 'd1', starred: false });
    memories.addMemory({ id: 'm2', description: '', forgotten: true, diary: 'd1', starred: false });

    expect(store.activeMemories.map(m => m.id)).toEqual(['m1']);
    expect(store.forgottenMemories.map(m => m.id)).toEqual(['m2']);
  });

  it('Never drops below one diary memory slot', () => {
    store.setMaxDiaryMemories(2);

    store.decrementMaxDiaryMemories();
    store.decrementMaxDiaryMemories();
    store.decrementMaxDiaryMemories();

    expect(store.maxDiaryMemories).toEqual(1);

    store.incrementMaxDiaryMemories();
    expect(store.maxDiaryMemories).toEqual(2);
  });

  it('Toggles resources and diaries between lost and found', () => {
    store.addResource(resource({ id: 'r1' }));
    store.addDiary(diary({ id: 'd1' }));

    store.toggleResource({ id: 'r1' });
    expect(store.resources[0].lost).toBe(true);

    store.toggleDiary({ id: 'd1' });
    expect(store.diaries[0].lost).toBe(true);
    expect(store.hasDiary).toBe(false);
  });

  it('Updates and removes resources and diaries by id', () => {
    store.addResource(resource({ id: 'r1', name: 'Before' }));
    store.updateResource(resource({ id: 'r1', name: 'After' }));
    expect(store.resources[0].name).toEqual('After');

    store.removeResource({ id: 'r1' });
    expect(store.resources).toEqual([]);

    store.addDiary(diary({ id: 'd1', name: 'Before' }));
    store.updateDiary(diary({ id: 'd1', name: 'After' }));
    expect(store.diaries[0].name).toEqual('After');

    store.removeDiary({ id: 'd1' });
    expect(store.diaries).toEqual([]);
  });
});
