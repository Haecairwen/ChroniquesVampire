import JournalPane from 'Components/JournalPane';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';

const buildStore = ({ die = 3, currentPrompt = { id: 'a', page: 4, count: 1 }, d6 = 2, d10 = 5 } = {}) => {
  const roll = vi.fn();

  const store = createStore({
    modules: {
      actions: {
        namespaced: true,
        state: {
          d6,
          d10,
          lastRoll: '?',
          prompts: [],
          currentPromptIdx: 0,
        },
        getters: {
          die: () => die,
          currentRoll: () => `${die} (+${d10}, -${d6})`,
          currentPrompt: () => currentPrompt,
          journalEntries: () => [],
        },
        actions: {
          roll,
          makePromptCurrent: vi.fn(),
          removePrompt: vi.fn(),
        },
        mutations: {
          addPrompt: vi.fn(),
          incrementPrompt: vi.fn(),
          decrementPrompt: vi.fn(),
          updatePromptEntry: vi.fn(),
        },
      },
      notifications: {
        namespaced: true,
        actions: {
          showNotification: vi.fn(),
        },
        mutations: {
          hide: vi.fn(),
        },
      },
    },
  });

  return { store, roll };
};

describe('components/JournalPane.vue', () => {
  it('Has the correct component name', () => {
    expect(JournalPane.name).toEqual('JournalPane');
  });

  it('Shows the dice values and the resulting move', () => {
    const { store } = buildStore({ die: 3, d6: 2, d10: 5 });

    const wrapper = shallowMount(JournalPane, { global: { plugins: [store] } });

    const dice = wrapper.findAll('.die-face');

    expect(dice.length).toEqual(3);
    expect(dice.at(0).text()).toEqual('5');
    expect(dice.at(1).text()).toEqual('2');
    expect(dice.at(2).text()).toEqual('+3');
  });

  it('Shows placeholders before the first roll', () => {
    const { store } = buildStore({ die: NaN, d6: NaN, d10: NaN });

    const wrapper = shallowMount(JournalPane, { global: { plugins: [store] } });

    const dice = wrapper.findAll('.die-face');

    expect(dice.at(0).text()).toEqual('?');
    expect(dice.at(1).text()).toEqual('?');
    expect(dice.at(2).text()).toEqual('?');
  });

  it('Animates the dice, then rolls', async () => {
    vi.useFakeTimers();

    const { store, roll } = buildStore();

    const wrapper = shallowMount(JournalPane, { global: { plugins: [store] } });

    wrapper.vm.dramaticRoll();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rolling).toBe(true);
    expect(roll).not.toHaveBeenCalled();
    expect(wrapper.findAll('.die-rolling').length).toEqual(3);

    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(roll).toHaveBeenCalled();
    expect(wrapper.vm.rolling).toBe(false);
    expect(wrapper.vm.hasRolled).toBe(true);

    vi.useRealTimers();
  });

  it('Ignores clicks while a roll is in progress', async () => {
    vi.useFakeTimers();

    const { store, roll } = buildStore();

    const wrapper = shallowMount(JournalPane, { global: { plugins: [store] } });

    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();

    vi.runAllTimers();

    expect(roll).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it.each([
    [3, { id: 'a', page: 7, count: 1 }, 'The night carries you forward to prompt 7.'],
    [-2, { id: 'a', page: 4, count: 2 }, 'The past holds you — visit 2 of prompt 4.'],
    [0, { id: 'a', page: 5, count: 1 }, 'Three visits exhausted — you move on to prompt 5.'],
  ])('Narrates the outcome of a roll (die: %s)', async (die, currentPrompt, message) => {
    const { store } = buildStore({ die, currentPrompt });

    const wrapper = shallowMount(JournalPane, { global: { plugins: [store] } });

    expect(wrapper.vm.rollMessage).toEqual('');

    wrapper.setData({ hasRolled: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rollMessage).toEqual(message);
  });
});
