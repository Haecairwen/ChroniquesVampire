<template>
    <SlideDownPanelComponent v-model="saving">
        <template #closed-heading>
            {{ $t('save.heading') }}
        </template>
        <div class="grid grid-rows gap-1 my-2">
            <a
                class="hidden"
                download='save-game'
                target="_blank"
                ref="download"
                href='about:blank'
            />
            <ButtonComponent 
              class="w-full"
              @click="toFile"
            >
              {{ $t('save.toFile') }}
            </ButtonComponent>
            <ButtonComponent 
              class="w-full"
              @click="toLocalStorage"
              v-if="supportsLocalStorage"
            >
              {{ $t('save.toLocalStorage') }}
            </ButtonComponent>
          </div>
    </SlideDownPanelComponent>
</template>

<script>
import ButtonComponent from 'Components/ButtonComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import { getStateFromStore, serialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';

export default {
  name: 'SaveMenuComponent',
  data() {
    return {
      saving: false,
    }
  },
  components: {
    SlideDownPanelComponent,
    ButtonComponent,
  },
  computed: {
    supportsLocalStorage() {
      return supportsLocalStorage();
    },
  },
  methods: {
    toFile() {
      const data = serialize(getStateFromStore());
      this.$refs.download.href = URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
      this.$refs.download.click();
      this.saving = false;
    },
    toLocalStorage() {
      const data = serialize(getStateFromStore());
      localStorage.set('save-game', data);
      this.saving = false;
    },
  }
}
</script>