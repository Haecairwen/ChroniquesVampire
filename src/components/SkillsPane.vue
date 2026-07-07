<template>
  <CardComponent id="skills">
    <HeadingComponent level="2" icon="dagger">{{ $t('skills.heading') }}</HeadingComponent>
    <FormToggleComponent 
      @save="validatedAddSkill"
      @toggle="toggleAddingControls"
      :show-controls="showAddingControls"
    >
      <template #button>
        {{ $t('skills.add') }}
      </template>
      <template #form>
        <TextInputComponent
          :placeholder="$t('common.description')"
          v-model="newSkill.name"
          @keyup.enter="validatedAddSkill"
        />
        <label>
          <CheckboxComponent
            v-model="newSkill.checked"
          />
          {{ $t('skills.checked') }}
        </label>
      </template>
    </FormToggleComponent>

    <FormComponent
      class="my-2"
      @save="validatedUpdateSkill"
      @cancel="closeEditingControls"
      @remove="validatedRemoveSkill"
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
        v-model="editSkill.name"
        @keyup.enter="validatedUpdateSkill"
      />
        <label>
          <CheckboxComponent
            v-model="editSkill.checked"
          />
          {{ $t('skills.checked') }}
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
          class="select-none"
          v-for="skill in skills"
          :key="`skill-${skill.id}`"
      >
        <div class="grid grid-cols-6">
          <span class="col-span-5">
            <span 
              class="cursor-pointer hover:text-blood-400"
              @click="validatedToggleSkill(skill)"
            >
              <span>{{skill.name}}</span>
              <span v-if="skill.checked">
                (x)
              </span>
            </span>
          </span>
          <span 
              class="cursor-pointer select-none flex-initial text-right mx-2 hover:text-blood-400"
              @click="startEdit(skill)"
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
import HeadingComponent from 'Components/HeadingComponent';
import FormComponent from 'Components/FormComponent';
import FormToggleComponent from 'Components/FormToggleComponent';
import CheckboxComponent from 'Components/CheckboxComponent';
import TextInputComponent from 'Components/TextInputComponent';
import { mapState, mapActions } from 'pinia';
import { useSkillsStore } from 'Stores/skills';
import { useNotificationsStore } from 'Stores/notifications';
import entityFactory from 'Libs/entities/skills';


export default {
  name: 'SkillsPane',
  data: function() {
      return {
          showAddingControls: false,
          showEditingControls: false,
          newSkill: entityFactory(),
          editSkill: entityFactory(),
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
    ...mapState(useSkillsStore, {
      skills: 'sortedSkills',
    }),
  },
  methods: {
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    ...mapActions(useSkillsStore, [
      'add',
      'remove',
      'toggle',
      'update',
    ]),
    validatedAddSkill(){
      if (this.newSkill.name === '') {
        this.showNotification({message: this.$t('common.needDescription'), type:'warning'});
        return;
      }

      this.add(this.newSkill);

      this.toggleAddingControls();
    },
    startEdit(skill) {
      this.editSkill = entityFactory(skill);
      this.showEditingControls = true;
    },
    validatedToggleSkill(skill) {
      this.hideNotification();

      if (this.editSkill.id === skill.id) {
        this.showNotification({message: this.$t('skills.editLocked'), type:'warning'});
        return;
      }

      this.toggle(skill);
    },
    validatedUpdateSkill() {
      if (this.editSkill.name === '') {
        this.showNotification({message: this.$t('common.needDescription'), type:'warning'});
        return;
      }

      this.update(this.editSkill);
      this.closeEditingControls();
    },
    validatedRemoveSkill() {
      let skillToRemove;

      this.skills.some(skill => {
        if (skill.id === this.editSkill.id) {
          skillToRemove = skill;
          return true;
        }
      });

      this.remove(skillToRemove);
      this.closeEditingControls();
    },
    toggleAddingControls() {
      this.hideNotification();
      this.showAddingControls = !this.showAddingControls;
      this.newSkill = entityFactory();
    },
    closeEditingControls() {
      this.hideNotification();
      this.showEditingControls = false;
      this.editSkill = entityFactory();
    },
  },
}
</script>