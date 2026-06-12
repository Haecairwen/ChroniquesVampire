<template>
  <CardComponent id="characters">
    <HeadingComponent level="2">{{ $t('characters.heading') }}</HeadingComponent>

    <FormToggleComponent 
      @save="validatedAdd"
      @toggle="toggleAddingControls"
      :show-controls="showAddingControls"
    >
      <template #button>
        {{ $t('characters.add') }}
      </template>
      <template #form>
        <TextInputComponent
          :placeholder="$t('common.name')"
          v-model="newCharacter.name"
          @keyup.enter="validatedAdd"
        />
        <TextAreaComponent
          :placeholder="$t('characters.bio')"
          v-model="newCharacter.bio"
        />
        <label>
          <CheckboxComponent
            v-model="newCharacter.immortal"
          />
          {{ $t('characters.immortal') }}
        </label>
        <label>
          <CheckboxComponent
            v-model="newCharacter.dead"
          />
          {{ $t('characters.dead') }}
        </label>
      </template>
    </FormToggleComponent>

    <FormComponent
      class="my-2"
      ref="editForm"
      @save="validatedUpdate"
      @cancel="closeEditingControls"
      @remove="validatedRemove"
      v-show="showEditingControls"
      :buttons="[
        {
            type: 'default',
            event: 'save',
            label: $t('common.save'),
        },
        {
            type: 'default',
            event: 'cancel',
            label: $t('common.cancel'),
        },
        {
            type: 'default',
            event: 'remove',
            label: $t('common.remove'),
        },
      ]"
    >
      <TextInputComponent
        :placeholder="$t('common.name')"
        v-model="editCharacter.name"
        @keyup.enter="add"
      />
        <TextAreaComponent
          :placeholder="$t('characters.bio')"
          v-model="editCharacter.bio"
        />
        <label>
          <CheckboxComponent
            v-model="editCharacter.immortal"
          />
          {{ $t('characters.immortal') }}
        </label>
        <label>
          <CheckboxComponent
            v-model="editCharacter.dead"
          />
          {{ $t('characters.dead') }}
        </label>
    </FormComponent>
    
    <transition-group
      class="my-2"
      tag="ul"
      enter-active-class="transition-all duration-100 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      move-class="transition-transform duration-500 ease-in-out"
    >
      <li
        v-for="character in characters"
        :key="`character-${character.id}`"
        >
          <CardComponent class="my-2" :class="{'bg-gilt-950/30 border-gilt-700': character.immortal}">
            <div class="flex border-b mb-2">
              <HeadingComponent
                level="6"
                class="select-none flex-1"
              >
                <div
                  :class="{
                    'line-through': character.dead,
                    'cursor-pointer': true,
                  }"
                  @click="validatedToggle(character)"
                >
                  {{ character.name }}
                  <span v-if="character.immortal">{{ $t('characters.immortalTag') }}</span>
                </div>
              </HeadingComponent>
              <div class="flex-initial text-right">
                <span 
                  class="cursor-pointer mx-2 hover:text-blood-400"
                  @click="startEdit(character)"
                >
                {{ $t('common.edit') }}
              </span>
            </div>
          </div>
          <div>{{character.bio}}</div>
          </CardComponent>
        </li>
    </transition-group>
  </CardComponent>
</template>

<script>
import CardComponent from 'Components/CardComponent';
import HeadingComponent from 'Components/HeadingComponent';
import FormComponent from 'Components/FormComponent';
import FormToggleComponent from 'Components/FormToggleComponent';
import CheckboxComponent from 'Components/CheckboxComponent';
import TextAreaComponent from 'Components/TextAreaComponent';
import TextInputComponent from 'Components/TextInputComponent';
import { mapState, mapActions } from 'pinia';
import { useCharactersStore } from 'Stores/characters';
import { useNotificationsStore } from 'Stores/notifications';
import entityFactory from 'Libs/entities/characters';

export default {
  name: 'CharactersPane',
  data: function() {
      return {
          showAddingControls: false,
          showEditingControls: false,
          editCharacter: entityFactory(),
          newCharacter: entityFactory(),
      }
  },
  components: {
      CardComponent,
      FormComponent,
      FormToggleComponent,
      HeadingComponent,
      CheckboxComponent,
      TextAreaComponent,
      TextInputComponent,
    },
  computed: {
    ...mapState(useCharactersStore, {
      characters: 'sortedCharacters',
    }),
  },
  methods: {
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    ...mapActions(useCharactersStore, [
        'add',
        'update',
        'remove',
        'toggle',
      ]),
      validatedToggle(character) {
        this.hideNotification();

        if (this.editCharacter.id === character.id) {
          this.showNotification({message: this.$t('characters.editLocked'), type:'warning'});
          return;
        }
        
        this.toggle(character);
      },
      validatedAdd(){
      if (this.newCharacter.name === '' || this.newCharacter.bio === '') {
        this.showNotification({message: this.$t('characters.needNameBio'), type:'warning'});
        return;
      }
      
      this.add(this.newCharacter);

      this.toggleAddingControls();
    },
    validatedRemove() {
      let toRemove;
      
      this.characters.some(character => {
        if (character.id === this.editCharacter.id) {
          toRemove = character;
          return true;
        }
      });

      this.remove(toRemove);
      this.closeEditingControls();
    },
    validatedUpdate() {
      if (this.editCharacter.name === '' || this.editCharacter.bio === '') {
        this.showNotification({message: this.$t('characters.needNameBio'), type:'warning'});
        return;
      }

      this.update(this.editCharacter);
      
      this.closeEditingControls();
    },
    startEdit(character) {
      this.editCharacter = entityFactory(character);
      this.showEditingControls = true;

      // Scroll the edit form in the next tick to allow the dom to be updated.
      this.$nextTick(() => {
        const rect = this.$refs.editForm.$el.getBoundingClientRect();
        window.scrollTo({top: rect.y + window.scrollY, behavior: 'smooth'});
      });
    },
    toggleAddingControls() {
      this.hideNotification();
      this.showAddingControls = !this.showAddingControls;
      this.newCharacter = entityFactory();
    },
    closeEditingControls()
    {
      this.hideNotification();
      this.showEditingControls = false;
      this.editCharacter = entityFactory();
    },
  }
}
</script>