import JournalPane from 'Components/JournalPane';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useActionsStore } from 'Stores/actions';

const mountPane = ({ d6 = 2, d10 = 5, prompts = [{ id: 'a', page: 4, count: 1, text: '', entry: '' }] } = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      actions: {
        d6,
        d10,
        lastRoll: '?',
        prompts,
        currentPromptIdx: 0,
      },
    },
  });

  const wrapper = shallowMount(JournalPane, { global: { plugins: [pinia] } });

  return { wrapper, actions: useActionsStore() };
};

describe('components/JournalPane.vue', () => {
  it('Has the correct component name', () => {
    expect(JournalPane.name).toEqual('JournalPane');
  });

  it('Shows the dice values and the resulting move', () => {
    const { wrapper } = mountPane({ d6: 2, d10: 5 });

    const dice = wrapper.findAll('.die-face');

    expect(dice.length).toEqual(3);
    expect(dice.at(0).text()).toEqual('5');
    expect(dice.at(1).text()).toEqual('2');
    expect(dice.at(2).text()).toEqual('+3');
  });

  it('Shows placeholders before the first roll', () => {
    const { wrapper } = mountPane({ d6: NaN, d10: NaN });

    const dice = wrapper.findAll('.die-face');

    expect(dice.at(0).text()).toEqual('?');
    expect(dice.at(1).text()).toEqual('?');
    expect(dice.at(2).text()).toEqual('?');
  });

  it('Animates the dice, then rolls', async () => {
    vi.useFakeTimers();

    const { wrapper, actions } = mountPane();

    wrapper.vm.dramaticRoll();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rolling).toBe(true);
    expect(actions.roll).not.toHaveBeenCalled();
    expect(wrapper.findAll('.die-rolling').length).toEqual(3);

    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    expect(actions.roll).toHaveBeenCalled();
    expect(wrapper.vm.rolling).toBe(false);
    expect(wrapper.vm.hasRolled).toBe(true);

    vi.useRealTimers();
  });

  it('Ignores clicks while a roll is in progress', async () => {
    vi.useFakeTimers();

    const { wrapper, actions } = mountPane();

    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();
    wrapper.vm.dramaticRoll();

    vi.runAllTimers();

    expect(actions.roll).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it.each([
    [{ d6: 1, d10: 4 }, { id: 'a', page: 7, count: 1 }, 'The night carries you forward to prompt 7.'],
    [{ d6: 4, d10: 2 }, { id: 'a', page: 4, count: 2 }, 'The past holds you — visit 2 of prompt 4.'],
    [{ d6: 2, d10: 2 }, { id: 'a', page: 5, count: 1 }, 'Three visits exhausted — you move on to prompt 5.'],
  ])('Narrates the outcome of a roll (dice: %o)', async ({ d6, d10 }, currentPrompt, message) => {
    const { wrapper } = mountPane({ d6, d10, prompts: [{ ...currentPrompt, text: '', entry: '' }] });

    expect(wrapper.vm.rollMessage).toEqual('');

    wrapper.setData({ hasRolled: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.rollMessage).toEqual(message);
  });
});
