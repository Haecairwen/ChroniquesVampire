<template>
    <SlideDownPanelComponent v-model="importing">
        <template #closed-heading>
            {{ $t('import.heading') }}
        </template>
        <template #open-heading>
            {{ $t('import.heading') }}
        </template>

        <p class="text-sm text-night-400 my-2">
            {{ $t('import.explanation') }}
        </p>

        <p class="text-sm text-gilt-300 my-2" v-if="hasTexts">
            {{ $t('import.packLoaded') }}
        </p>

        <TextAreaComponent
            v-model="pasted"
            rows="6"
            :placeholder="$t('import.placeholder')"
        />

        <label class="block my-2 text-sm">
            {{ $t('import.fromFile') }}
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
            {{ $t('import.button') }}
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
        this.showNotification({message: this.$t('import.needOneFile'), type: 'warning'});
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        this.runImport(reader.result);
      };

      reader.onerror = () => {
        this.showNotification({message: this.$t('common.readError'), type: 'danger'});
      };

      reader.readAsText(evt.target.files[0]);
    },
    runImport(raw) {
      const { imported, warnings } = this.importFromText(raw);

      if (imported === 0) {
        this.showNotification({message: this.$t('import.nothingFound'), type: 'warning'});
        return;
      }

      const message = warnings.length
        ? this.$t('import.successWarnings', { count: imported, warnings: warnings.length }, warnings.length)
        : this.$t('import.success', { count: imported });

      this.showNotification({message, type: 'default'});

      this.pasted = '';
      this.importing = false;
    },
  },
}
</script>
