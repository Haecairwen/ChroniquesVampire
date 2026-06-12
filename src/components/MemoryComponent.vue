<template>
  <CardComponent class="my-3">
    <div class="flex border-b mb-2">
      <HeadingComponent :class="{'flex-1': true, 'line-through': memory.forgotten}" level="6">
        <span v-if="memory.starred" class="text-gilt-400" :title="$t('memories.starTitle')">★</span>
        {{ memory.description }}
      </HeadingComponent>
      <div class="flex-initial text-right">
        <span
          class="text-xs text-night-400 select-none"
          v-if="!memory.forgotten && memory.diary === '' && !memory.starred"
        >
          {{ events(memory).length }}/3
        </span>
        <span
          class="cursor-pointer mx-2 hover:text-blood-400"
          @click="$emit('edit-memory', memory)"
          v-if="!memory.starred"
        >
          {{ $t('common.edit') }}
        </span>
      </div>
    </div>

    <ul class="my-3">
      <li
          v-for="event in events(memory)"
          :key="`event-${event.id}`"
      >
          <CardComponent class="my-2">
            <div class="flex">
              <span :class="{'flex-1': true, 'line-through': memory.forgotten, 'text-night-400': memory.forgotten}">{{event.description}}</span>
              <div class="text-right flex-inital">
                <RemoveCrossComponent @remove="$emit('remove-event', event)" />
              </div>
            </div>
          </CardComponent>
      </li>
    </ul>
    
    <FormToggleComponent 
      @save="add"
      @toggle="toggleControls"
      :showControls="showControls"
      v-if="canAddEvents"
    >
      <template #button>  
        {{ $t('memories.addEvent') }}
      </template>
      <template #form>
        <TextInputComponent
          :placeholder="$t('common.description')"
          v-model="newEvent.description"
          @keyup.enter="add"
        />
      </template>
    </FormToggleComponent>
  

    <div class="my-2 grid grid-rows gap-2" v-show="canToggle && ((!memory.forgotten || memory.forgotten && memory.diary !== '') || canAddMemories)">
      <ButtonComponent
        class="w-full"
        @click="$emit('toggle-memory', memory)"
      >
        <span v-if="memory.forgotten">
          {{ $t('memories.recover') }}
        </span>
        <span v-else-if="memory.diary === ''">
          {{ $t('memories.forget') }}
        </span>
        <span v-else>
          {{ $t('memories.scratchOut') }}
        </span>
      </ButtonComponent>
      
      <template v-if="canDiarise">
        <ButtonComponent
          class="w-full"
          @click="$emit('diarise-memory', memory)"
          v-if="memory.diary === '' && !isDiaryFull"
        >
          {{ $t('memories.sendToDiary') }}
        </ButtonComponent>
        <ButtonComponent
          class="w-full"
          @click="$emit('undiarise-memory', memory)"
          v-else-if="memory.diary !== '' && canAddMemories"
        >
          {{ $t('memories.recoverFromDiary') }}
        </ButtonComponent>
      </template>
    </div>

    <div class="my-2" v-if="canStar && !memory.starred">
      <ButtonComponent
        type="secondary"
        class="w-full"
        @click="onPublishClick"
      >
        {{ confirmingStar ? $t('memories.cementForever') : $t('memories.publish') }}
      </ButtonComponent>
    </div>
  </CardComponent>
</template>

<script>
import CardComponent from 'Components/CardComponent';
import ButtonComponent from 'Components/ButtonComponent';
import FormToggleComponent from 'Components/FormToggleComponent';
import HeadingComponent from 'Components/HeadingComponent';
import RemoveCrossComponent from 'Components/RemoveCrossComponent';
import TextInputComponent from 'Components/TextInputComponent';
import { mapState, mapActions } from 'pinia';
import { useMemoriesStore } from 'Stores/memories';
import { useResourcesStore } from 'Stores/resources';
import { useNotificationsStore } from 'Stores/notifications';
import { eventEntityFactory } from 'Libs/entities/memories';

export default {
  name: 'MemoryComponent',
  emits: ['edit-memory', 'remove-event', 'toggle-memory', 'diarise-memory', 'undiarise-memory', 'add-event', 'star-memory'],
  props: {
    memory: {
      type: Object,
      required: true,
      validator: (memory) => 'string' === typeof memory.diary && 'boolean' === typeof memory.forgotten,
    },
    canAddMemories: {
      type: Boolean,
      required: true,
    },
    canAddEvents: {
      type: Boolean,
      required: true,
    },
    canDiarise: {
      type: Boolean,
      required: true,
    },
    canToggle: {
      type: Boolean,
      required: true,
    },
    canStar: {
      type: Boolean,
      required: true,
    },
  },
  data: function() {
      return {
          showControls: false,
          newEvent:  eventEntityFactory({memory: this.memory.id}),
          confirmingStar: false,
          starConfirmTimer: null,
      }
  },
  components: {
    ButtonComponent,
    CardComponent,
    FormToggleComponent,
    HeadingComponent,
    RemoveCrossComponent,
    TextInputComponent,
  },
  computed: {
    ...mapState(useResourcesStore, ['hasDiary', 'isDiaryFull']),
    ...mapState(useMemoriesStore, {
      events: 'eventsFor',
    }),
  },
  methods: {
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    add(){
      if (this.newEvent.description === '') {
        this.showNotification({message: this.$t('common.needDescription'), type: 'warning'});
        return;
      }

      const event = eventEntityFactory(this.newEvent);

      this.$emit('add-event', event);
      this.toggleControls();
    },
    toggleControls() {
      this.hideNotification();
      this.showControls = !this.showControls;
      this.newEvent = eventEntityFactory({memory: this.memory.id});
    },
    onPublishClick() {
      if (!this.confirmingStar) {
        this.confirmingStar = true;
        this.starConfirmTimer = setTimeout(() => {
          this.confirmingStar = false;
        }, 2500);
        return;
      }

      clearTimeout(this.starConfirmTimer);
      this.confirmingStar = false;
      this.$emit('star-memory', this.memory);
    },
  },
  beforeUnmount() {
    clearTimeout(this.starConfirmTimer);
  },
}
</script>