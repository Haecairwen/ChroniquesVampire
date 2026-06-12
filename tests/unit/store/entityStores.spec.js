import { setActivePinia, createPinia } from 'pinia';
import { useCharactersStore } from 'Stores/characters';
import { useMarksStore } from 'Stores/marks';
import { useSkillsStore } from 'Stores/skills';

describe('store/characters', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCharactersStore();
  });

  it('Adds, updates, toggles, and removes characters', () => {
    store.add({ id: 'a', name: 'Mara', bio: 'A rival', immortal: false, dead: false });

    store.update({ id: 'a', name: 'Mara', bio: 'An ally', immortal: true, dead: false });
    expect(store.characters[0].bio).toEqual('An ally');

    store.toggle({ id: 'a' });
    expect(store.characters[0].dead).toBe(true);

    store.remove({ id: 'a' });
    expect(store.characters).toEqual([]);
  });

  it('Sorts characters with the dead last, then alphabetically', () => {
    store.add({ id: 'a', name: 'Constance', bio: '', immortal: false, dead: true });
    store.add({ id: 'b', name: 'Bela', bio: '', immortal: false, dead: false });
    store.add({ id: 'c', name: 'Aldric', bio: '', immortal: false, dead: false });

    expect(store.sortedCharacters.map(c => c.name)).toEqual(['Aldric', 'Bela', 'Constance']);
  });
});

describe('store/marks', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMarksStore();
  });

  it('Adds, updates, and removes marks', () => {
    store.add({ id: 'a', description: 'A scar' });

    store.update({ id: 'a', description: 'A deep scar' });
    expect(store.marks[0].description).toEqual('A deep scar');

    store.remove({ id: 'a' });
    expect(store.marks).toEqual([]);
  });
});

describe('store/skills', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useSkillsStore();
  });

  it('Adds, updates, toggles, and removes skills', () => {
    store.add({ id: 'a', name: 'Stealth', checked: false });

    store.update({ id: 'a', name: 'Shadowcraft', checked: false });
    expect(store.skills[0].name).toEqual('Shadowcraft');

    store.toggle({ id: 'a' });
    expect(store.skills[0].checked).toBe(true);

    store.remove({ id: 'a' });
    expect(store.skills).toEqual([]);
  });

  it('Sorts checked skills last, then alphabetically', () => {
    store.add({ id: 'a', name: 'Hunting', checked: true });
    store.add({ id: 'b', name: 'Charm', checked: false });
    store.add({ id: 'c', name: 'Archery', checked: false });

    expect(store.sortedSkills.map(s => s.name)).toEqual(['Archery', 'Charm', 'Hunting']);
  });
});
