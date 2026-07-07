<template>
  <CardComponent id="marks">
    <HeadingComponent level="2" icon="drop">{{ $t('marks.heading') }}</HeadingComponent>
    <FormToggleComponent 
      @save="validatedAddMark"
      @toggle="toggleAddingControls"
      :show-controls="showAddingControls"
    >
      <template #button>
        {{ $t('marks.add') }}
      </template>
      <template #form>
        <TextInputComponent
          :placeholder="$t('common.description')"
          v-model="newMark.description"
          @keyup.enter="validatedAddMark"
        />
      </template>
    </FormToggleComponent>

    <FormComponent
      class="my-2"
      @save="validatedUpdateMark"
      @cancel="closeEditingControls"
      @remove="validatedRemoveMark"
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
        v-model="editMark.description"
        @keyup.enter="validatedUpdateMark"
      />
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
        class="my-2"
        v-for="mark in marks"
        :key="`mark-${mark.id}`"
      >
          <div class="grid grid-cols-6">
            <span class="col-span-5">{{mark.description}}</span>
            <span 
              class="cursor-pointer select-none flex-initial text-right mx-2 hover:text-blood-400"
              @click="startEdit(mark)"
            >
              {{ $t('common.edit') }}
            </span>
          </div>
      </li>
    </transition-group>
  </CardComponent>
</template>

<script>
import CardComponent from 'Components/CardComponent';
import FormComponent from 'Components/FormComponent';
import FormToggleComponent from 'Components/FormToggleComponent';
import HeadingComponent from 'Components/HeadingComponent';
import TextInputComponent from 'Components/TextInputComponent';
import { mapState, mapActions } from 'pinia';
import { useMarksStore } from 'Stores/marks';
import { useNotificationsStore } from 'Stores/notifications';
import entityFactory from 'Libs/entities/marks';

export default{
  name: 'MarksPane',
  data: function() {
      return {
        newMark: entityFactory(),
        editMark: entityFactory(),
        showAddingControls: false,
        showEditingControls: false,
      }
  },
  components: {
    CardComponent,
    FormComponent,
    FormToggleComponent,
    HeadingComponent,
    TextInputComponent,
  },
  computed: {
    ...mapState(useMarksStore, ['marks'])
  },
  methods: {
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    ...mapActions(useMarksStore, [
      'add',
      'update',
      'remove'
    ]),
    validatedAddMark() {
      if (this.newMark.description === '') {
        this.showNotification({message: this.$t('common.needDescription'), type:'warning'});
        return;
      }
      
      this.add(this.newMark);

      this.toggleAddingControls();
    },
    validatedRemoveMark() {
      let markToRemove;

      this.marks.some(mark => {
        if (mark.id === this.editMark.id) {
          markToRemove = mark;
          return true;
        }
      });

      this.remove(markToRemove);

      this.closeEditingControls();
    },
    validatedUpdateMark() {
      if (this.editMark.description === '') {
        this.showNotification({message: this.$t('common.needDescription'), type:'warning'});
        return;
      }

      this.update(this.editMark);
      this.closeEditingControls();
    },
    startEdit(mark) {
      this.editMark = entityFactory(mark);
      this.showEditingControls = true;
    },
    closeEditingControls() {
      this.hideNotification();
      this.showEditingControls = false;
      this.editMark = entityFactory();
    },
    toggleAddingControls() {
      this.hideNotification();
      this.showAddingControls = !this.showAddingControls;
      this.newMark = entityFactory();
    },
  }
}
</script>