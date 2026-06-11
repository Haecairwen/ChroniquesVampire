import ButtonComponent from 'Components/ButtonComponent';
import { shallowMount } from '@vue/test-utils';

const CLASSES = [
  'py-1',
  'px-4',
  'rounded',
  'font-display',
  'tracking-wide',
  'transition-colors',
  'focus:outline-none',
  'focus:ring-2',
  'ring-0',
];

const BUTTON_TYPES = {
    default: [
        'bg-night-700',
        'hover:bg-night-600',
        'text-parchment-200',
        'ring-night-500',
    ],
    primary: [
        'bg-blood-700',
        'hover:bg-blood-600',
        'text-parchment-50',
        'ring-blood-500',
    ],
    secondary: [
        'bg-gilt-700',
        'hover:bg-gilt-600',
        'text-night-950',
        'ring-gilt-400',
    ],
};

describe('components/ButtonComponent.vue', () => {
    it('Has the correct component name', () => { 
        expect(ButtonComponent.name).toEqual('ButtonComponent');
    });

    it('Uses a default button style if no style is given.', () => {
        const classes = [...CLASSES, ...BUTTON_TYPES.default];

        const wrapper = shallowMount(ButtonComponent);

        expect(wrapper.classes()).toEqual(classes);
    });

    it.each([
        ['default', BUTTON_TYPES.default],
        ['primary', BUTTON_TYPES.primary],
        ['secondary', BUTTON_TYPES.secondary],
    ])('Can specify different button types that inherit the correct styles', (type, typeClasses) => {
        const classes = [...CLASSES, ...typeClasses];

        const wrapper = shallowMount(
            ButtonComponent,
            {
                propsData: {
                    type
                }
            }
        );

        expect(wrapper.classes()).toEqual(classes);
    });

    it('Supports setting the default slot within the button.',  () => {
        const slot = '<div id="test">foo</div>';
        const wrapper = shallowMount(
            ButtonComponent,
            {
                slots: {
                    default: slot
                }
            }
        );

        expect(wrapper.find('#test').html()).toEqual(slot);
    });

    it('Emits a synthetic click event when receiving a real click.', async () => {
        const wrapper = shallowMount(ButtonComponent);
        await wrapper.trigger('click');
        expect(wrapper.emitted().click).toBeTruthy();
    });
});