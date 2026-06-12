<template>
  <CardComponent id="memories">
    <HeadingComponent level="2">{{ $t('memories.heading') }}</HeadingComponent>

    <div class="flex items-center justify-center gap-2 mb-3 select-none">
      <span
        class="cursor-pointer hover:text-blood-400 px-1"
        :title="$t('memories.loseSlot')"
        @click="decrementMaxMemories"
        v-html="'&minus;'"
      />
      <div
        class="flex flex-wrap items-center justify-center gap-2"
        :title="$t('memories.slots', { active: activeMemories.length, max: maxMemories })"
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
        :title="$t('memories.gainSlot')"
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
        {{ $t('memories.add') }}
      </template>
      <template #form>
        <TextInputComponent
          :placeholder="$t('common.description')"
          v-model="newMemory.description"
          @keyup.enter="validatedAddMemory"
        />
        <label>
          <CheckboxComponent
            v-model="newMemory.forgotten"
          />
          {{ $t('memories.forgotten') }}
        </label>
        <label v-if="hasDiary && !isDiaryFull">
          <CheckboxComponent
            v-model="newMemory.diary"
            :true-value="diary.id"
            :false-value="''"
          />
          {{ $t('memories.diarised') }}
        </label>
      </template>
    </FormToggleComponent>
    <div class="text-center italic text-blood-300 my-2" v-else>
      {{ $t('memories.full') }}
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
          :placeholder="$t('common.description')"
          v-model="editMemory.description"
          @keyup.enter="validatedUpdateMemory"
        />
        <label>
          <CheckboxComponent
            v-model="editMemory.forgotten"
          />
          {{ $t('memories.forgotten') }}
        </label>
        <label v-if="(hasDiary && !isDiaryFull) || editMemory.diary !== ''">
          <CheckboxComponent
            v-model="editMemory.diary"
            :true-value="diary.id"
            :false-value="''"
          />
          {{ $t('memories.diarised') }}
        </label>

        <div class="mt-2" v-if="hasEvents(editMemory)">
          <HeadingComponent level="6">
            {{ $t('memories.events') }}
          </HeadingComponent>
          <div
            v-for="event in editEvents"
            :key="`edit-event-${event.id}`"
          >
              <TextInputComponent
                :placeholder="$t('common.description')"
                v-model="event.description"
              />
          </div>
        </div>
    </FormComponent>

    <transition-group
        enter-active-class="transition-all duration-400 ease-out"
        leave-active-class="transition-all duration-400 ease-in"
        enter-from-class="opacity-0 scale-40"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
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
            {{ $t('memories.diary') }}
        </template>
          <div v-if="diaryMemories.length > 0">
            <transition-group
                enter-active-class="transition-all duration-400 ease-out"
                leave-active-class="transition-all duration-400 ease-in"
                enter-from-class="opacity-0 scale-40"
                enter-to-class="opacity-100 scale-100"
                leave-from-class="opacity-100 scale-100"
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
          {{ $t('memories.diaryEmpty') }}
        </div>
    </SlideDownPanelComponent>

    <SlideDownPanelComponent>
        <template #closed-heading>
            {{ $t('memories.forgottenHeading') }}
        </template>
          <div v-if="forgottenMemories.length > 0">
            <transition-group
                enter-active-class="transition-all duration-400 ease-out"
                leave-active-class="transition-all duration-400 ease-in"
                enter-from-class="opacity-0 scale-40"
                enter-to-class="opacity-100 scale-100"
                leave-from-class="opacity-100 scale-100"
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
          {{ $t('memories.noneForgotten') }}
        </div>
    </SlideDownPanelComponent>

    <SlideDownPanelComponent v-if="starredMemories.length > 0">
        <template #closed-heading>
            {{ $t('memories.starredHeading') }}
        </template>
          <transition-group
              enter-active-class="transition-all duration-400 ease-out"
              leave-active-class="transition-all duration-400 ease-in"
              enter-from-class="opacity-0 scale-40"
              enter-to-class="opacity-100 scale-100"
              leave-from-class="opacity-100 scale-100"
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
import { mapState, mapActions } from 'pinia';
import { useMemoriesStore } from 'Stores/memories';
import { useResourcesStore } from 'Stores/resources';
import { useNotificationsStore } from 'Stores/notifications';
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
    ...mapState(useMemoriesStore, ['memories', 'maxMemories', 'canAddMemories', 'forgottenMemories', 'activeMemories', 'starredMemories', 'hasEvents']),
    ...mapState(useMemoriesStore, {
        events: 'eventsFor',
    }),
    ...mapState(useResourcesStore, {
        diary: 'diary',
        hasDiary: 'hasDiary',
        isDiaryFull: 'isDiaryFull',
        diaryMemories: 'memories',
    }),
  },
  methods: {
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    ...mapActions(useMemoriesStore, [
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
        this.showNotification({message: this.$t('common.needDescription'), type:'warning'});
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
        this.showNotification({message: this.$t('memories.editLocked'), type:'warning'});
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