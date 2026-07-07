import ButtonComponent from 'Components/ButtonComponent';
import { shallowMount } from '@vue/test-utils';

const CLASSES = [
  'v-btn',
];

const BUTTON_TYPES = {
    default: [],
    primary: [
        'v-btn--primary',
    ],
    secondary: [
        'v-btn--secondary',
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
                props: {
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