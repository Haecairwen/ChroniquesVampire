<template>
    <SlideDownPanelComponent v-model="importing">
        <template #closed-heading>
            Import Prompts
        </template>
        <template #open-heading>
            Import Prompts
        </template>

        <p class="text-sm text-night-400 my-2">
            Paste the Prompts section from your copy of the book as plain
            text (headers like 1a, 1b, 1c followed by the prompt text), or
            choose a .txt file. The journal will then show each prompt's
            text based on the page and visit.
        </p>

        <p class="text-sm text-gilt-300 my-2" v-if="hasTexts">
            A prompt pack is already loaded; importing replaces it.
        </p>

        <TextAreaComponent
            v-model="pasted"
            rows="6"
            placeholder="1a&#10;In your blood-hunger, you destroy someone close to you. ..."
        />

        <label class="block my-2 text-sm">
            Or import from a file:
            <input
                type="file"
                accept=".txt,text/plain"
                class="block w-full mt-1 text-night-400"
                @change="fromFile"
            />
        </label>

        <ButtonComponent
            type="primary"
            class="w-full my-2"
            @click="importPasted"
        >
            Import
        </ButtonComponent>
    </SlideDownPanelComponent>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import ButtonComponent from 'Components/ButtonComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import TextAreaComponent from 'Components/TextAreaComponent';
import { usePromptTextsStore } from 'Stores/promptTexts';
import { useNotificationsStore } from 'Stores/notifications';

export default {
  name: 'PromptImportComponent',
  data() {
    return {
      importing: false,
      pasted: '',
    };
  },
  components: {
    ButtonComponent,
    SlideDownPanelComponent,
    TextAreaComponent,
  },
  computed: {
    ...mapState(usePromptTextsStore, ['hasTexts']),
  },
  methods: {
    ...mapActions(usePromptTextsStore, ['importFromText']),
    ...mapActions(useNotificationsStore, ['showNotification']),
    importPasted() {
      this.runImport(this.pasted);
    },
    fromFile(evt) {
      if (evt.target.files.length !== 1) {
        this.showNotification({message: 'You must select one file to import.', type: 'warning'});
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.runImport(reader.result);
      };

      reader.onerror = () => {
        this.showNotification({message: 'Unable to read file.', type: 'danger'});
      };

      reader.readAsText(evt.target.files[0]);
    },
    runImport(raw) {
      const { imported, warnings } = this.importFromText(raw);

      if (imported === 0) {
        this.showNotification({message: warnings[0] ?? 'No prompts found.', type: 'warning'});
        return;
      }

      const summary = warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : '';

      this.showNotification({message: `Imported ${imported} prompts${summary}.`, type: 'default'});

      this.pasted = '';
      this.importing = false;
    },
  },
}
</script>
