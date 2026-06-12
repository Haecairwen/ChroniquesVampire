<template>
    <SlideDownPanelComponent v-model="loading">
        <template #closed-heading>
            {{ $t('load.heading') }}
        </template>
        <div class="grid grid-rows gap-1 my-2">
            <input 
                type="file"
                class="hidden"
                ref="upload"
                @change="load"
            />
            <ButtonComponent
              class="w-full"
              @click="confirmThen('file', () => $refs.upload.click())"
            >
              {{ armed === 'file' ? $t('load.overwrite') : $t('load.fromFile') }}
            </ButtonComponent>
            <ButtonComponent
              class="w-full"
              @click="confirmThen('storage', fromLocalStorage)"
              v-if="supportsLocalStorage"
            >
              {{ armed === 'storage' ? $t('load.overwrite') : $t('load.fromLocalStorage') }}
            </ButtonComponent>
        </div>
    </SlideDownPanelComponent>
</template>

<script>
import ButtonComponent from './ButtonComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import { restoreState, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';
import { mapActions } from 'pinia';
import { useActionsStore } from 'Stores/actions';
import { useMemoriesStore } from 'Stores/memories';
import { useNotificationsStore } from 'Stores/notifications';

const DISARM_AFTER_MS = 3000;

export default {
  name: 'LoadMenuComponent',
  data() {
    return {
      loading: false,
      armed: '',
      disarmTimer: null,
    }
  },
  components: {
    ButtonComponent,
    SlideDownPanelComponent,
  },
  computed:{
    supportsLocalStorage,
    gameInProgress() {
      return Boolean(
        useActionsStore().prompts.length ||
        useMemoriesStore().memories.length
      );
    },
  },
  methods: {
    ...mapActions(useNotificationsStore, ['hide', 'showNotification']),
    confirmThen(kind, callback) {
      if (this.gameInProgress && this.armed !== kind) {
        this.armed = kind;
        clearTimeout(this.disarmTimer);
        this.disarmTimer = setTimeout(() => {
          this.armed = '';
        }, DISARM_AFTER_MS);
        return;
      }

      clearTimeout(this.disarmTimer);
      this.armed = '';
      callback();
    },
    load(evt) {
      if (evt.target.files.length !== 1) { 
        this.showNotification({message: this.$t('load.needOneFile'), type: 'warning'});
        return;
      }

      this.hide();

      const file = evt.target.files[0];

        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const data = deserialize(reader.result);
            restoreState(data);
            this.loading = false;
          } catch {
            this.showNotification({message: this.$t('load.decodeError'), type:'danger'});
          }

        }

        reader.onerror = () => {
          this.showNotification({message: this.$t('common.readError'), type:'danger'});
        }
        
        reader.readAsText(file);
    },
    fromLocalStorage() {
      this.hide();

      try {
        const data = deserialize(localStorage.get('save-game'));
        restoreState(data);
      } catch {
        this.showNotification({message: this.$t('load.decodeError'), type:'danger'});
      }

      this.loading = false;
    },
  },
  beforeUnmount() {
    clearTimeout(this.disarmTimer);
  },
}
</script>