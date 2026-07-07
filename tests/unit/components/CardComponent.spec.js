import CardComponent from 'Components/CardComponent';
import { shallowMount } from '@vue/test-utils';

describe('components/CardComponent.vue', () => {
    it('Has the correct component name', () => {
        expect(CardComponent.name).toEqual('CardComponent');
    });

    it('Creates a framed panel with four ornamental corners.', () => {
        const wrapper = shallowMount(CardComponent);

        expect(wrapper.classes()).toEqual(['v-panel']);

        const corners = wrapper.findAll('.v-panel__corner');
        expect(corners).toHaveLength(4);

        ['tl', 'tr', 'bl', 'br'].forEach((corner) => {
            expect(wrapper.find(`.v-panel__corner--${corner}`).exists()).toBe(true);
        });
    });

    it('Marks the corner ornaments as decorative for assistive tech.', () => {
        const wrapper = shallowMount(CardComponent);

        wrapper.findAll('.v-panel__corner').forEach((corner) => {
            expect(corner.attributes('aria-hidden')).toEqual('true');
        });
    });

    it('Supports setting the default slot within the card.',  () => {
        const slot = '<div id="test">foo</div>';
        const wrapper = shallowMount(
            CardComponent,
            {
                slots: {
                    default: slot
                }
            }
        );

        expect(wrapper.classes()).toEqual(['v-panel']);
        expect(wrapper.find('#test').html()).toEqual(slot);
    });
});
