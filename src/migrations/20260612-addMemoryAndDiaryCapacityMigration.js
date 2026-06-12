export default {
    description: 'Adds configurable memory slot and diary capacity fields.',
    requiredSignature: 4,
    migrate(data) {
        if (data.maxMemories === undefined) {
            data.maxMemories = 5;
        }

        if (data.maxDiaryMemories === undefined) {
            data.maxDiaryMemories = 4;
        }

        data.memories.forEach((memory) => {
            if (memory.starred === undefined) {
                memory.starred = false;
            }
        });

        return data;
    }
};
