import JournalPane from 'Components/JournalPane';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

const buildStore = ({ die = 3, currentPrompt = { id: 'a', page: 4, count: 1 }, d6 = 2, d10 = 5 } = {}) => {
  const roll = jest.fn();

  const store = new Vuex.Store({
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
          makePromptCurrent: jest.fn(),
          removePrompt: jest.fn(),
        },
        mutations: {
          addPrompt: jest.fn(),
          incrementPrompt: jest.fn(),
          decrementPrompt: jest.fn(),
          updatePromptEntry: jest.fn(),
        },
      },
      notifications: {
        namespaced: true,
        actions: {
          showNotification: jest.fn(),
        },
        mutations: {
          hide: jest.fn(),
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

    const wrapper = shallowMount(JournalPane, { store, localVue });

    const dice = wrapper.findAll('.die-face');

    expect(dice.length).toEqual(3);
    expect(dice.at(0).text()).toEqual('5');
    expect(dice.at(1).text()).toEqual('2');
    expect(dice.at(2).text()).toEqual('+3');
  });

  it('Shows placeholders before the first roll', () => {
    const { store } = buildStore({ die: NaN, d6: NaN, d10: NaN });

    const wrapper = shallowMount(JournalPane, { store, localVue });

    const dice = wrapper.findAll('.die-face');

    expect(dice.at(0).text()).toEqual('?');
    expect(dice.at(1).text()).toEqual('?');
    expect(dice.at(2).text()).toEqual('?');
  });

  it('Animates the dice, then rolls', async () => {
    jest.useFakeTimers();

    const { store, roll } = buildStore();

    const wrapper = shallowMount(JournalPane, { store, localVue });

    wrapper.vm.dramaticRoll();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rolling).toBe(true);
    expect(roll).not.toHaveBeenCalled();
    expect(wrapper.findAll('.die-rolling').length).toEqual(3);

    jest.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(roll).toHaveBeenCalled();
    expect(wrapper.vm.rolling).toBe(false);
    expect(wrapper.vm.hasRolled).toBe(true);

    jest.useRealTimers();
  });

  it('Ignores clicks while a roll is in progress', async () => {
    jest.useFakeTimers();

    const { store, roll } = buildStore();

    const wrapper = shallowMount(JournalPane, { store, localVue });

    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();

    jest.runAllTimers();

    expect(roll).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it.each([
    [3, { id: 'a', page: 7, count: 1 }, 'The night carries you forward to prompt 7.'],
    [-2, { id: 'a', page: 4, count: 2 }, 'The past holds you — visit 2 of prompt 4.'],
    [0, { id: 'a', page: 5, count: 1 }, 'Three visits exhausted — you move on to prompt 5.'],
  ])('Narrates the outcome of a roll (die: %s)', async (die, currentPrompt, message) => {
    const { store } = buildStore({ die, currentPrompt });

    const wrapper = shallowMount(JournalPane, { store, localVue });

    expect(wrapper.vm.rollMessage).toEqual('');

    wrapper.setData({ hasRolled: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rollMessage).toEqual(message);
  });
});
