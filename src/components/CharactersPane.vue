<template>
  <CardComponent id="characters">
    <HeadingComponent level="2">Characters</HeadingComponent>

    <FormToggleComponent 
      @save="validatedAdd"
      @toggle="toggleAddingControls"
      :show-controls="showAddingControls"
    >
      <template #button>
        Add a new Character?
      </template>
      <template #form>
        <TextInputComponent
          placeholder="Name"
          v-model="newCharacter.name"
          @keyup.enter="validatedAdd"
        />
        <TextAreaComponent
          placeholder="Bio"
          v-model="newCharacter.bio"
        />
        <label>
          <CheckboxComponent
            v-model="newCharacter.immortal"
          />
          Immortal?
        </label>
        <label>
          <CheckboxComponent
            v-model="newCharacter.dead"
          />
          Dead?
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
            label: 'Save',
        },
        {
            type: 'default',
            event: 'cancel',
            label: 'Cancel',
        },
        {
            type: 'default',
            event: 'remove',
            label: 'Remove',
        },
      ]"
    >
      <TextInputComponent
        placeholder="Name"
        v-model="editCharacter.name"
        @keyup.enter="add"
      />
        <TextAreaComponent
          placeholder="Bio"
          v-model="editCharacter.bio"
        />
        <label>
          <CheckboxComponent
            v-model="editCharacter.immortal"
          />
          Immortal?
        </label>
        <label>
          <CheckboxComponent
            v-model="editCharacter.dead"
          />
          Dead?
        </label>
    </FormComponent>
    
    <transition-group
      class="my-2"
      tag="ul"
      enter-active-class="transition-all duration-100 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-class="opacity-100"
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
                  <span v-if="character.immortal">(Immortal)</span>
                </div>
              </HeadingComponent>
              <div class="flex-initial text-right">
                <span 
                  class="cursor-pointer mx-2 hover:text-blood-400"
                  @click="startEdit(character)"
                >
                Edit
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
import { mapMutations, mapActions, mapGetters, } from 'vuex';
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
    ...mapGetters('characters', ['characters']),
  },
  methods: {
    ...mapMutations('notifications', {
      hideNotification: 'hide'
    }),
    ...mapActions('notifications', ['showNotification']),
    ...mapMutations('characters', [
        'add',
        'update',
        'remove',
        'toggle',
      ]),
      validatedToggle(character) {
        this.hideNotification();

        if (this.editCharacter.id === character.id) {
          this.showNotification({message: 'You cannot change this character whilst it is being edited.', type:'warning'});
          return;
        }
        
        this.toggle(character);
      },
      validatedAdd(){
      if (this.newCharacter.name === '' || this.newCharacter.bio === '') {
        this.showNotification({message:'You must provide a name & bio.', type:'warning'});
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
        this.showNotification({message:'You must provide a name & bio.', type:'warning'});
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