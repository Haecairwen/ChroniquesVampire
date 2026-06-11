<template>
  <CardComponent id="journal">
    <HeadingComponent level="2">Journal</HeadingComponent>

    <div class="sticky top-0 bg-white z-10 text-center border-b pb-4 mb-4">
      <div class="grid grid-cols-2 grid-rows-2 gap-2 mb-2">
        <span class="text-gray-300">Last roll:</span>
        <span>Current roll:</span>
        <span class="text-gray-300">{{ lastRoll }}</span>
        <span>{{ currentRoll }}</span>
      </div>

      <ButtonComponent
        type="primary"
        class="w-full my-2"
        @click="roll"
      >
        Roll for the next prompt
      </ButtonComponent>

      <div class="mt-2 text-red-700" v-if="currentPrompt.page">
        <strong>Current prompt:</strong> {{ currentPrompt.page }}
        <span v-html="tally(currentPrompt.count)" />
      </div>
    </div>

    <div v-if="journalEntries.length === 0" class="text-gray-400 italic text-center my-4">
      Your story has not yet begun. Roll for your first prompt.
    </div>

    <transition-group
      tag="ul"
      enter-active-class="transition-all duration-100 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <li
        v-for="entry in journalEntries"
        :key="`journal-entry-${entry.id}`"
        class="mb-4 p-4 border rounded"
        :class="{'border-red-300 bg-red-50': entry.id === currentPrompt.id}"
      >
        <div class="flex justify-between items-center mb-2 select-none">
          <HeadingComponent level="4">
            Prompt {{ entry.page }}
            <span v-html="tally(entry.count)" />
          </HeadingComponent>
          <div class="flex-initial">
            <span
              class="cursor-pointer mx-1 hover:text-gray-400"
              title="Set as current prompt"
              @click="makePromptCurrent(entry)"
              v-html="'&rarr;'"
              v-show="entry.id !== currentPrompt.id"
            />
            <span
              class="cursor-pointer mx-1 hover:text-gray-400"
              title="Increment visits"
              @click="incrementPrompt(entry)"
              v-html="'&plus;'"
              v-show="entry.count < 3"
            />
            <span
              class="cursor-pointer mx-1 hover:text-gray-400"
              title="Decrement visits"
              @click="decrementPrompt(entry)"
              v-html="'&minus;'"
              v-show="entry.count > 1"
            />
            <span
              class="cursor-pointer mx-1 hover:text-gray-400"
              title="Remove prompt"
              @click="removePrompt(entry)"
              v-html="'&times;'"
              v-show="entry.id !== currentPrompt.id"
            />
          </div>
        </div>

        <p class="italic text-gray-400 mb-2">
          {{ entry.text || 'Prompt text not yet available.' }}
        </p>

        <textarea
          placeholder="What happened?"
          class="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 ring-gray-200 resize-none"
          rows="3"
          :value="entry.entry"
          @change="updatePromptEntry({prompt: entry, entry: $event.target.value})"
        />
      </li>
    </transition-group>

    <SlideDownPanelComponent>
      <template #closed-heading>
        Manually add a prompt
      </template>
      <FormComponent
        @save="validatedAddPrompt"
        @cancel="toggleManualControls"
      >
        <div class="grid grid-rows md:grid-cols-2 gap-2">
          <div class="grid grid-rows gap-2">
            <label for="new-prompt-number">
              Prompt Number:
            </label>
            <input
              id="new-prompt-number"
              type="number"
              step="1"
              class="w-full shadow border rounded py-1 px-2 m-1 text-gray-700 leading-tight focus:outline-none focus:ring-2 ring-gray-200"
              v-model="newPrompt.page"
              :min="firstUnusedPrompt"
            />
          </div>
          <div class="grid grid-rows gap-2">
            <label for="new-prompt-count">
              Times visited:
            </label>
            <select
              id="new-prompt-count"
              class="w-full shadow border rounded py-1 px-2 m-1 text-gray-700 leading-tight focus:outline-none focus:ring-2 ring-gray-200"
              v-model="newPrompt.count"
            >
              <option
                v-for="i in [1,2,3]"
                :key="`visits-${i}`"
                :value="i"
              >
                {{i}}
              </option>
            </select>
          </div>
        </div>
        <label>
          <input
              type="checkbox"
              class="shadow border rounded py-2 px-2 m-1 text-gray-700 leading-tight focus:outline-none focus:ring-2 ring-gray-200"
              v-model="makeCurrent"
              :true-value="true"
              :false-value="false"
          />
          Current?
        </label>
      </FormComponent>
    </SlideDownPanelComponent>
  </CardComponent>
</template>

<script>
import CardComponent from 'Components/CardComponent';
import ButtonComponent from 'Components/ButtonComponent';
import FormComponent from 'Components/FormComponent';
import HeadingComponent from 'Components/HeadingComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';
import entityFactory from 'Libs/entities/prompts';

export default {
  name: 'JournalPane',
  data() {
    return {
      newPrompt: entityFactory({
        page: 1,
        count: 1,
      }),
      makeCurrent: true,
    };
  },
  components: {
    CardComponent,
    ButtonComponent,
    FormComponent,
    HeadingComponent,
    SlideDownPanelComponent,
  },
  computed: {
      ...mapState('actions', ['d6', 'd10', 'lastRoll']),
      ...mapGetters('actions', ['die', 'currentRoll', 'currentPrompt', 'journalEntries']),
      tally() {
          return (count) => {
              let tally = '';
              let char = '&omicron;';
              if (count >= 3) {
                char = '&oslash;';
              }

              for (let i = 0; i < count; i++) {
                  tally += char;
              }

              return tally;
          };
      },
      firstUnusedPrompt() {
        var unused = 1;

        if (!this.journalEntries.length) {
          return unused;
        }

        const prompts = [...this.journalEntries];
        prompts.sort((a, b) => a.page > b.page ? 1 : -1);

        prompts.some((prompt) => {
          let page = prompt.page;
          if (page > unused) {
            return true;
          }

          unused = page + 1;

          return false;
        });

        return unused;
      }
  },
  methods: {
    ...mapActions('actions', ['roll', 'makePromptCurrent', 'removePrompt']),
    ...mapMutations('actions', ['addPrompt', 'incrementPrompt', 'decrementPrompt', 'updatePromptEntry']),
    ...mapMutations('notifications', {
      hideNotification: 'hide'
    }),
    ...mapActions('notifications', ['showNotification']),
    validatedAddPrompt() {
      const promptExists = this.journalEntries.some((prompt) => {
        return prompt.page === parseInt(this.newPrompt.page, 10);
      });

      if (promptExists) {
        this.showNotification({message: 'This prompt already exists, you cannot re-add it', type: 'warning'});
        return;
      }

      const prompt = {
        ...this.newPrompt,
      };

      prompt.page = parseInt(prompt.page, 10);

      this.addPrompt(prompt);

      if (this.makeCurrent) {
        this.makePromptCurrent(prompt)
      }

      this.toggleManualControls();
    },
    toggleManualControls() {
      this.hideNotification();

      this.newPrompt = entityFactory({
        page: this.firstUnusedPrompt,
        count: 1,
      });

      this.makeCurrent = !(this.currentPrompt && this.currentPrompt.page);
    }
  }
}
</script>
