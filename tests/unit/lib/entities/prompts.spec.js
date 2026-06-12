import { baseEntityFactory } from 'Libs/entities';
import prompts from 'Libs/entities/prompts';

vi.mock('Libs/entities');

describe('lib/entities/prompts.js', () => {
    it('Can create a default prompt entity.', () => {
        const prompt = prompts();

        expect(prompt.page).toEqual(1);
        expect(prompt.count).toEqual(0);
        expect(prompt.text).toEqual('');
        expect(prompt.entry).toEqual('');
        expect(baseEntityFactory).toHaveBeenCalledWith({}, 'prompt');
    });

    it('Can create a prompt entity with injected data.', () => {
        baseEntityFactory.mockImplementation((values) => values);

        const data = {
            page: 10,
            count: 2,
            text: 'The book prompt text.',
            entry: "The player's journal entry.",
        };

        const prompt = prompts(data);

        expect(prompt.page).toEqual(data.page);
        expect(prompt.count).toEqual(data.count);
        expect(prompt.text).toEqual(data.text);
        expect(prompt.entry).toEqual(data.entry);
        expect(baseEntityFactory).toHaveBeenCalledWith(data, 'prompt');
    });
});