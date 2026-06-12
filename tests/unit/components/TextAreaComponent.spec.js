import TextAreaComponent from 'Components/TextAreaComponent';
import { shallowMount } from '@vue/test-utils';

describe('components/TextAreaComponent.vue', () => {
  it('Has the correct component name', () => {
    expect(TextAreaComponent.name).toEqual('TextAreaComponent');
  });

  it('Renders a themed textarea', () => {
    const wrapper = shallowMount(TextAreaComponent);

    expect(wrapper.element.tagName).toEqual('TEXTAREA');
    expect(wrapper.classes()).toContain('bg-night-900');
    expect(wrapper.classes()).toContain('resize-none');
  });

  it('Passes attributes through to the textarea', () => {
    const wrapper = shallowMount(TextAreaComponent, {
      attrs: { placeholder: 'Bio', rows: '4' },
    });

    expect(wrapper.attributes('placeholder')).toEqual('Bio');
    expect(wrapper.attributes('rows')).toEqual('4');
  });

  it('Binds the value and emits input events for v-model', async () => {
    const wrapper = shallowMount(TextAreaComponent, {
      props: { modelValue: 'before' },
    });

    expect(wrapper.element.value).toEqual('before');

    wrapper.element.value = 'after';
    wrapper.trigger('input');

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['after']);
  });
});
