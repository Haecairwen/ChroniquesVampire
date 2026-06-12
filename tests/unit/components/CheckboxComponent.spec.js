import CheckboxComponent from 'Components/CheckboxComponent';
import { shallowMount } from '@vue/test-utils';

describe('components/CheckboxComponent.vue', () => {
  it('Has the correct component name', () => {
    expect(CheckboxComponent.name).toEqual('CheckboxComponent');
  });

  it('Renders a themed checkbox', () => {
    const wrapper = shallowMount(CheckboxComponent);

    expect(wrapper.element.tagName).toEqual('INPUT');
    expect(wrapper.attributes('type')).toEqual('checkbox');
    expect(wrapper.classes()).toContain('bg-night-900');
  });

  it('Is checked when the value matches the true value', () => {
    const wrapper = shallowMount(CheckboxComponent, {
      propsData: { value: true },
    });

    expect(wrapper.element.checked).toBe(true);
  });

  it('Emits boolean change events by default', async () => {
    const wrapper = shallowMount(CheckboxComponent, {
      propsData: { value: false },
    });

    wrapper.element.checked = true;
    wrapper.trigger('change');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted().change[0]).toEqual([true]);
  });

  it('Supports custom true and false values', async () => {
    const wrapper = shallowMount(CheckboxComponent, {
      propsData: {
        value: '',
        trueValue: 'diary-id',
        falseValue: '',
      },
    });

    expect(wrapper.element.checked).toBe(false);

    wrapper.element.checked = true;
    wrapper.trigger('change');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted().change[0]).toEqual(['diary-id']);

    wrapper.element.checked = false;
    wrapper.trigger('change');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted().change[1]).toEqual(['']);
  });
});
