export default {
    description: 'Adds text and entry fields to prompts.',
    requiredSignature: 3,
    migrate(data) {
        data.prompts.forEach((prompt) => {
            if (prompt.text === undefined) {
                prompt.text = '';
            }

            if (prompt.entry === undefined) {
                prompt.entry = '';
            }
        });

        return data;
    }
};
