<template>
  <CardComponent id="memories">
    <HeadingComponent level="2">Memories</HeadingComponent>

    <div class="flex items-center justify-center gap-2 mb-3 select-none">
      <span
        class="cursor-pointer hover:text-blood-400 px-1"
        title="Lose a Memory slot"
        @click="decrementMaxMemories"
        v-html="'&minus;'"
      />
      <div
        class="flex flex-wrap items-center justify-center gap-2"
        :title="`${activeMemories.length} of ${maxMemories} memories`"
      >
        <span
          v-for="i in maxMemories"
          :key="`memory-slot-${i}`"
          class="memory-slot"
          :class="{'memory-slot-filled': i <= activeMemories.length}"
        />
      </div>
      <span
        class="cursor-pointer hover:text-blood-400 px-1"
        title="Gain a Memory slot"
        @click="incrementMaxMemories"
        v-html="'&plus;'"
      />
    </div>

    <FormToggleComponent
      type="primary"
      @save="validatedAddMemory"
      @toggle="toggleAddingControls"
      :show-controls="showAddingControls"
      v-if="canAddMemories"
    >
      <template #button>
        Add a new Memory?
      </template>
      <template #form>
        <TextInputComponent
          placeholder="Description"
          v-model="newMemory.description"
          @keyup.enter="validatedAddMemory"
        />
        <label>
          <CheckboxComponent
            v-model="newMemory.forgotten"
          />
          Forgotten?
        </label>
        <label v-if="hasDiary && !isDiaryFull">
          <CheckboxComponent
            v-model="newMemory.diary"
            :true-value="diary.id"
            :false-value="''"
          />
          Diarised?
        </label>
      </template>
    </FormToggleComponent>
    <div class="text-center italic text-blood-300 my-2" v-else>
      Your mind is full. You must forget a memory to make room for more.
    </div>

    <FormComponent
      class="my-2"
      ref="editForm"
      @save="validatedUpdateMemory"
      @cancel="closeEditingControls"
      @remove="validatedRemoveMemory"
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
          placeholder="Description"
          v-model="editMemory.description"
          @keyup.enter="validatedUpdateMemory"
        />
        <label>
          <CheckboxComponent
            v-model="editMemory.forgotten"
          />
          Forgotten?
        </label>
        <label v-if="(hasDiary && !isDiaryFull) || editMemory.diary !== ''">
          <CheckboxComponent
            v-model="editMemory.diary"
            :true-value="diary.id"
            :false-value="''"
          />
          Diarised?
        </label>

        <div class="mt-2" v-if="hasEvents(editMemory)">
          <HeadingComponent level="6">
            Events
          </HeadingComponent>
          <div
            v-for="event in editEvents"
            :key="`edit-event-${event.id}`"
          >
              <TextInputComponent
                placeholder="Description"
                v-model="event.description"
              />
          </div>
        </div>
    </FormComponent>

    <transition-group
        enter-active-class="transition-all duration-400 ease-out"
        leave-active-class="transition-all duration-400 ease-in"
        enter-class="opacity-0 scale-40"
        enter-to-class="opacity-100 scale-100"
        leave-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-40"
    >
      <MemoryComponent
        v-for="memory in activeMemories"
        :key="`memory-${memory.id}`"
        :memory="memory"
        :can-add-memories="canAddMemories"
        :can-add-events="memory.id !== editMemory.id && events(memory).length < 3"
        :can-diarise="hasDiary && memory.id !== editMemory.id"
        :can-toggle="memory.id !== editMemory.id"
        :can-star="memory.id !== editMemory.id"
        @add-event="addEvent"
        @remove-event="validatedRemoveEvent"
        @edit-memory="startEdit"
        @toggle-memory="toggleMemory"
        @diarise-memory="diariseMemory"
        @undiarise-memory="undiariseMemory"
        @star-memory="starMemory"
    />
    </transition-group>

    <SlideDownPanelComponent v-if="hasDiary">
        <template #closed-heading>
            Diary
        </template>
          <div v-if="diaryMemories.length > 0">
            <transition-group
                enter-active-class="transition-all duration-400 ease-out"
                leave-active-class="transition-all duration-400 ease-in"
                enter-class="opacity-0 scale-40"
                enter-to-class="opacity-100 scale-100"
                leave-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-40"
            >
                <MemoryComponent
                    v-for="memory in diaryMemories"
                    :key="`diary-${memory.id}`"
                    :memory="memory"
                    :can-add-memories="canAddMemories"
                    :can-add-events="false"
                    :can-diarise="hasDiary"
                    :can-toggle="memory.id !== editMemory.id"
                    :can-star="memory.id !== editMemory.id"
                    @add-event="addEvent"
                    @remove-event="validatedRemoveEvent"
                    @edit-memory="startEdit"
                    @toggle-memory="toggleMemory"
                    @diarise-memory="diariseMemory"
                    @undiarise-memory="undiariseMemory"
                    @star-memory="starMemory"
                />
            </transition-group>
        </div>
        <div class="py-2" v-else>
          The diary is empty.
        </div>
    </SlideDownPanelComponent>

    <SlideDownPanelComponent>
        <template #closed-heading>
            Forgotten Memories
        </template>
          <div v-if="forgottenMemories.length > 0">
            <transition-group
                enter-active-class="transition-all duration-400 ease-out"
                leave-active-class="transition-all duration-400 ease-in"
                enter-class="opacity-0 scale-40"
                enter-to-class="opacity-100 scale-100"
                leave-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-40"
            >
                <MemoryComponent
                    v-for="memory in forgottenMemories"
                    :key="`memory-${memory.id}`"
                    :memory="memory"
                    :can-add-memories="canAddMemories"
                    :can-add-events="false"
                    :can-diarise="false"
                    :can-toggle="memory.id !== editMemory.id"
                    :can-star="false"
                    @add-event="addEvent"
                    @remove-event="validatedRemoveEvent"
                    @edit-memory="startEdit"
                    @toggle-memory="toggleMemory"
                    @diarise-memory="diariseMemory"
                    @undiarise-memory="undiariseMemory"
                  />
            </transition-group>
        </div>
        <div class="py-2" v-else>
          You have forgotten no memories... yet.
        </div>
    </SlideDownPanelComponent>

    <SlideDownPanelComponent v-if="starredMemories.length > 0">
        <template #closed-heading>
            Starred Memories
        </template>
          <transition-group
              enter-active-class="transition-all duration-400 ease-out"
              leave-active-class="transition-all duration-400 ease-in"
              enter-class="opacity-0 scale-40"
              enter-to-class="opacity-100 scale-100"
              leave-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-40"
          >
              <MemoryComponent
                  v-for="memory in starredMemories"
                  :key="`starred-${memory.id}`"
                  :memory="memory"
                  :can-add-memories="canAddMemories"
                  :can-add-events="false"
                  :can-diarise="false"
                  :can-toggle="false"
                  :can-star="false"
                  @add-event="addEvent"
                  @remove-event="validatedRemoveEvent"
                  @edit-memory="startEdit"
                  @toggle-memory="toggleMemory"
                  @diarise-memory="diariseMemory"
                  @undiarise-memory="undiariseMemory"
              />
          </transition-group>
    </SlideDownPanelComponent>
  </CardComponent>
</template>

<script>
import CardComponent from 'Components/CardComponent';
import HeadingComponent from 'Components/HeadingComponent';
import FormComponent from 'Components/FormComponent';
import FormToggleComponent from 'Components/FormToggleComponent';
import MemoryComponent from 'Components/MemoryComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import CheckboxComponent from 'Components/CheckboxComponent';
import TextInputComponent from 'Components/TextInputComponent';
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
import { memoryEntityFactory, eventEntityFactory } from 'Libs/entities/memories';

export default {
  name: 'MemoriesPane',
  data() {
    return {
      showAddingControls: false,
      showEditingControls: false,
      editMemory: memoryEntityFactory(),
      editEvents: [],
      newMemory: memoryEntityFactory(),
    }
  },
  components: {
      CardComponent,
      FormComponent,
      FormToggleComponent,
      HeadingComponent,
      MemoryComponent,
      SlideDownPanelComponent,
      CheckboxComponent,
      TextInputComponent,
    },
  computed: {
    ...mapState('memories', ['memories', 'maxMemories']),
    ...mapGetters('memories', ['canAddMemories', 'forgottenMemories', 'activeMemories', 'starredMemories', 'events', 'hasEvents']),
    ...mapGetters('resources', {
        diary: 'diary', 
        hasDiary: 'hasDiary', 
        isDiaryFull: 'isDiaryFull', 
        diaryMemories: 'memories',
    }),
  },
  methods: {
    ...mapMutations('notifications', {
      hideNotification: 'hide'
    }),
    ...mapActions('notifications', ['showNotification']),
    ...mapMutations('memories', [
      'addMemory',
      'updateMemory',
      'removeMemory',
      'toggleMemory',
      'addEvent',
      'removeEvent',
      'diarise',
      'undiarise',
      'updateEvent',
      'starMemory',
      'incrementMaxMemories',
      'decrementMaxMemories',
    ]),
    validatedAddMemory() {
      this.hideNotification
      if (this.newMemory.description === '') {
        this.showNotification({message: 'You must provide a description.', type:'warning'});
        return;
      }

      const memory = memoryEntityFactory(this.newMemory);

      this.addMemory(memory);

      this.toggleAddingControls();
    },
    validatedRemoveMemory(){
      if (this.hasEvents(this.editMemory)) {
        this.events(this.editMemory).forEach(event => {
          this.removeEvent(event);
        });
      }

      this.removeMemory(this.editMemory);

      this.closeEditingControls();
    },
    validatedRemoveEvent(event) {
      if (event.memory === this.editMemory.id) {
        this.showNotification({message: 'You cannot alter this memory whilst it is being edited.', type:'warning'});
        return;
      }

      this.removeEvent(event);
    },
    validatedUpdateMemory(){
      this.updateMemory(this.editMemory);

      if (this.hasEvents(this.editMemory)) {
        this.editEvents.forEach(event => this.updateEvent(event));
      }

      this.closeEditingControls();
    },
    diariseMemory(memory) {
      this.diarise({diary: this.diary, memory});
    },
    undiariseMemory(memory) {
      this.undiarise(memory);
    },
    startEdit(memory) {
      this.editMemory = memoryEntityFactory(memory);
      this.editEvents = this.events(this.editMemory).map(event => eventEntityFactory(event));
      this.showEditingControls = true;

      // Scroll the edit form in the next tick to allow the dom to be updated.
      this.$nextTick(() => {
        const rect = this.$refs.editForm.$el.getBoundingClientRect();
        window.scrollTo({top: rect.y + window.scrollY, behavior: 'smooth'});
      });
    },
    toggleAddingControls() {
      this.newMemory = memoryEntityFactory();

      this.showAddingControls = !this.showAddingControls;
    },
    closeEditingControls() {
      this.hideNotification();
      this.showEditingControls = false;
      this.editMemory = memoryEntityFactory();
      this.editEvents = [];
    },
  },
}
</script>