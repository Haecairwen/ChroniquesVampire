<template>
    <SlideDownPanelComponent v-model="loading">
        <template #closed-heading>
            Load
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
              {{ armed === 'file' ? 'Overwrite current game?' : 'From File' }}
            </ButtonComponent>
            <ButtonComponent
              class="w-full"
              @click="confirmThen('storage', fromLocalStorage)"
              v-if="supportsLocalStorage"
            >
              {{ armed === 'storage' ? 'Overwrite current game?' : 'From Local Storage' }}
            </ButtonComponent>
        </div>
    </SlideDownPanelComponent>
</template>

<script>
import ButtonComponent from './ButtonComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import { restoreState, deserialize } from 'Libs/gameState';
import localStorage, { supportsLocalStorage } from 'Libs/localStorage';
import { mapMutations, mapActions } from 'vuex';

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
      const state = this.$store.state;

      return Boolean(
        (state.actions && state.actions.prompts.length) ||
        (state.memories && state.memories.memories.length)
      );
    },
  },
  methods: {
    ...mapMutations('notifications', ['hide']),
    ...mapActions('notifications', ['showNotification']),
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
        this.showNotification({message: 'Unable to load file.  You must select one file to load.', type: 'warning'});
        return;
      }

      this.hide();

      const file = evt.target.files[0];

        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const data = deserialize(reader.result);
            restoreState(this.$store, data);
            this.loading = false;
          } catch {
            this.showNotification({message: 'Unable to decode save state.', type:'danger'});
          }

        }

        reader.onerror = () => {
          this.showNotification({message: 'Unable to read file.', type:'danger'});
        }
        
        reader.readAsText(file);
    },
    fromLocalStorage() {
      this.hide();

      try {
        const data = deserialize(localStorage.get('save-game'));
        restoreState(this.$store, data);
      } catch {
        this.showNotification({message: 'Unable to decode save state.', type:'danger'});
      }

      this.loading = false;
    },
  },
  beforeUnmount() {
    clearTimeout(this.disarmTimer);
  },
}
</script>