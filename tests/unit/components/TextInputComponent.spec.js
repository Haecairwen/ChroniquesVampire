import TextInputComponent from 'Components/TextInputComponent';
import { shallowMount } from '@vue/test-utils';

describe('components/TextInputComponent.vue', () => {
  it('Has the correct component name', () => {
    expect(TextInputComponent.name).toEqual('TextInputComponent');
  });

  it('Renders a themed text input by default', () => {
    const wrapper = shallowMount(TextInputComponent);

    expect(wrapper.element.tagName).toEqual('INPUT');
    expect(wrapper.attributes('type')).toEqual('text');
    expect(wrapper.classes()).toContain('bg-night-900');
    expect(wrapper.classes()).toContain('border-night-600');
  });

  it('Supports other input types', () => {
    const wrapper = shallowMount(TextInputComponent, {
      props: { type: 'number' },
    });

    expect(wrapper.attributes('type')).toEqual('number');
  });

  it('Passes attributes through to the input', () => {
    const wrapper = shallowMount(TextInputComponent, {
      attrs: { placeholder: 'Description' },
    });

    expect(wrapper.attributes('placeholder')).toEqual('Description');
  });

  it('Binds the value and emits input events for v-model', async () => {
    const wrapper = shallowMount(TextInputComponent, {
      props: { modelValue: 'before' },
    });

    expect(wrapper.element.value).toEqual('before');

    wrapper.element.value = 'after';
    wrapper.trigger('input');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['after']);
  });

  it('Forwards other listeners, such as keyup', async () => {
    const onKeyup = vi.fn();

    const wrapper = shallowMount(TextInputComponent, {
      attrs: { onKeyup },
    });

    wrapper.trigger('keyup');

    await wrapper.vm.$nextTick();

    expect(onKeyup).toHaveBeenCalled();
  });
});
