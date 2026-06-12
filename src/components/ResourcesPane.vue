<template>
  <CardComponent id="resources">
    <HeadingComponent level="2">Resources</HeadingComponent>
    <FormToggleComponent 
      class="my-2"
      @save="validatedAddResource"
      @toggle="toggleAddingResourceControls"
      :show-controls="showAddingResourceControls"
    >
      <template #button>
        Add a new Resource?
      </template>
      <template #form>
        <TextInputComponent
          placeholder="Description"
          v-model="newResource.name"
          @keyup.enter="validatedAddResource"
        />
        <label>
          <CheckboxComponent
            v-model="newResource.lost"
          />
          Lost?
        </label>
        <label>
          <CheckboxComponent
            v-model="newResource.stationary"
          />
          Stationary?
        </label>
      </template>
    </FormToggleComponent>

    <FormToggleComponent 
      @save="validatedAddDiary"
      @toggle="toggleAddingDiaryControls"
      :show-controls="showAddingDiaryControls"
      v-if="!hasDiary"
    >
      <template #button>
        Add a Diary?
      </template>
      <template #form>
        <TextInputComponent
          placeholder="Name"
          v-model="newDiary.name"
          @keyup.enter="addDiary"
        />
        <label>
          <CheckboxComponent
            v-model="newDiary.lost"
          />
          Lost?
        </label>
      </template>
    </FormToggleComponent>

    <FormComponent
      class="my-2"
      @save="validatedUpdateResource"
      @cancel="closeEditingResourceControls"
      @remove="validatedRemoveResource"
      v-show="showEditingResourceControls"
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
        v-model="editResource.name"
        @keyup.enter="validatedAddResource"
      />
      <label>
        <CheckboxComponent
          v-model="editResource.lost"
        />
        Lost?
      </label>
      <label>
        <CheckboxComponent
          v-model="editResource.stationary"
        />
        Stationary?
      </label>
    </FormComponent>

    <FormComponent
      class="my-2"
      @save="validatedUpdateDiary"
      @cancel="closeEditingDiaryControls"
      @remove="validatedRemoveDiary"
      v-show="showEditingDiaryControls"
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
        v-model="editDiary.name"
        @keyup.enter="validatedAddResource"
      />
      <label>
        <CheckboxComponent
          v-model="editDiary.lost"
        />
        Lost?
      </label>
    </FormComponent>

    <transition-group
      class="my-2 pb-2"
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
        class="select-none"
        v-for="resource in resources"
        :key="`resource-${resource.id}`"
      >
        <div class="grid grid-cols-6">
          <span class="col-span-5">
            <span
              class="cursor-pointer hover:text-blood-400"
              @click="validatedToggleResource(resource)"
            >
              <span :class="{'line-through': resource.lost}">{{resource.name}}</span>
              <span v-if="resource.stationary"> (stationary)</span>
            </span>
          </span>
          <span 
              class="cursor-pointer select-none flex-initial text-right mx-2 hover:text-blood-400"
              @click="startEditResource(resource)"
            >
            Edit
          </span>
        </div>
      </li>
    </transition-group>
    <transition-group
      class="my-2 border-t pt-2"
      tag="ul"
      enter-active-class="transition-all duration-100 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      move-class="transition-transform duration-500 ease-in-out"
      v-show="diaries.length > 0"
    >
      <li
        class="select-none"
        v-for="diary in diaries"
        :key="`diary-${diary.id}`"
      >
        <div class="grid grid-cols-6">
          <span class="col-span-5">
            <span
              class="cursor-pointer hover:text-blood-400"
              @click="validatedToggleDiary(diary)"
            >
              <span :class="{'line-through': diary.lost}">{{diary.name}}</span>
              <span class="italic"> (diary - {{ activeMemories.length }} of {{ maxDiaryMemories }} memories)</span>
            </span>
            <span
              class="cursor-pointer hover:text-blood-400 px-1"
              title="The diary has decayed and lost capacity"
              @click="decrementMaxDiaryMemories"
              v-html="'&minus;'"
            />
            <span
              class="cursor-pointer hover:text-blood-400 px-1"
              title="The diary has been expanded"
              @click="incrementMaxDiaryMemories"
              v-html="'&plus;'"
            />
          </span>
          <span
              class="cursor-pointer select-none flex-initial text-right mx-2 hover:text-blood-400"
              @click="startEditDiary(diary)"
            >
            Edit
          </span>
        </div>
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
import TextInputComponent from 'Components/TextInputComponent';
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex';
import { resourceEntityFactory, diaryEntityFactory } from 'Libs/entities/resources';

export default {
  name: 'ResourcesPane',
  data: function() {
      return {
          showAddingResourceControls: false,
          showAddingDiaryControls: false,
          showEditingResourceControls: false,
          showEditingDiaryControls: false,
          newResource: resourceEntityFactory(),
          newDiary: diaryEntityFactory(),
          editResource: resourceEntityFactory(),
          editDiary: diaryEntityFactory(),
      }
  },
  components: {
      CardComponent,
      FormComponent,
      FormToggleComponent,
      HeadingComponent,
      CheckboxComponent,
      TextInputComponent,
    },
  computed: {
    ...mapState('resources', ['maxDiaryMemories']),
    ...mapGetters('resources', ['hasDiary', 'diaries', 'resources', 'diary', 'activeMemories']),
  },
  methods: {
    ...mapMutations('notifications', {
      hideNotification: 'hide'
    }),
    ...mapActions('notifications', ['showNotification']),
    ...mapMutations('resources', [
      'addResource',
      'updateResource',
      'removeResource',
      'toggleResource',
      'addDiary',
      'updateDiary',
      'removeDiary',
      'toggleDiary',
      'incrementMaxDiaryMemories',
      'decrementMaxDiaryMemories',
    ]),
    validatedAddResource(){
      if (this.newResource.name === '') {
        this.showNotification({message: 'You must provide a description.', type: 'warning'});
        return;
      }

      this.addResource(this.newResource);
      this.toggleAddingResourceControls();
    },
    validatedToggleResource(resource) {
      this.hideNotification();

      if (this.editResource.id === resource.id) {
        this.showNotification({message: 'You cannot change this resource whilst it is being edited.', type:'warning'});
        return;
      }

      this.toggleResource(resource);
    },
    validatedToggleDiary(diary) {
      this.hideNotification();

      if (this.editDiary.id === diary.id) {
        this.showNotification({message: 'You cannot change this resource whilst it is being edited.', type:'warning'});
        return;
      }

      if (this.hasDiary) {
        if (diary.lost ) {
          this.showNotification({message: 'You may only have one active diary.', type: 'warning'});
          return;
        } else if (this.activeMemories.length > 0) {
          this.showNotification({message: 'Please cross out existing memories before losing the diary.', type: 'warning'});
          return;
        }
      }

      this.toggleDiary(diary);
    },
    validatedAddDiary() {
      if (this.newDiary.name === '') {
        this.showNotification({message: 'You must provide a description.', type: 'warning'});
        return;
      } else if (this.hasDiary) {
        this.showNotification({message: 'You may only have one active diary.', type: 'warning'});
        return;
      }

      this.addDiary(this.newDiary);
      this.toggleAddingDiaryControls();
    },
    validatedUpdateResource() {
      if (this.editResource.name === '') {
        this.showNotification({message: 'You must provide a description.', type: 'warning'});
        return;
      }

      this.updateResource(this.editResource);

      this.closeEditingResourceControls();
    },
    validatedUpdateDiary(){
      if (this.editDiary.name === '') {
        this.showNotification({message: 'You must provide a description.', type: 'warning'});
        return;
      } else if (this.diary && this.editDiary.id !== this.diary.id && this.editDiary.lost === false) {
        this.showNotification({message: 'You may only have one active diary.', type: 'warning'});
        return;
      }

      this.updateDiary(this.editDiary);

      this.closeEditingDiaryControls();
    },
    validatedRemoveResource() {
      let resourceToRemove;

      this.resources.some(resource => {
        if (resource.id === this.editResource.id) {
          resourceToRemove = resource;
          return true;
        }
      });

      this.removeResource(resourceToRemove);
      this.closeEditingResourceControls();
    },
    validatedRemoveDiary() {
      let diaryToRemove;

      this.diaries.some(diary => {
        if (diary.id === this.editDiary.id) {
          diaryToRemove = diary;
          return true;
        }
      });

      this.removeDiary(diaryToRemove);
      this.closeEditingDiaryControls();
    },
    startEditResource(resource){
      this.editResource = resourceEntityFactory(resource);
      this.showEditingResourceControls = true;
    },
    startEditDiary(diary){
      this.editDiary = diaryEntityFactory(diary);
      this.showEditingDiaryControls = true;
    },
    toggleAddingResourceControls() {
      this.hideNotification();
      this.showAddingResourceControls = !this.showAddingResourceControls;
      this.newResource = resourceEntityFactory();
    },
    toggleAddingDiaryControls() {
      this.hideNotification();
      this.showAddingDiaryControls = !this.showAddingDiaryControls;
      this.newDiary = diaryEntityFactory();
    },
    closeEditingResourceControls() {
      this.hideNotification();
      this.showEditingResourceControls = false;
      this.editResource = resourceEntityFactory();
    },
    closeEditingDiaryControls() {
      this.hideNotification();
      this.showEditingDiaryControls = false;
      this.editDiary = diaryEntityFactory();
    },
  }
}
</script>