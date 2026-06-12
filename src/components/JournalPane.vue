<template>
  <CardComponent id="journal">
    <HeadingComponent level="2">Journal</HeadingComponent>

    <div class="sticky top-0 bg-night-900 z-10 text-center border-b pb-4 mb-4">
      <div class="flex items-center justify-center gap-4 my-3 select-none">
        <div>
          <span class="die-face die-blood" :class="{'die-rolling': rolling}">
            <span class="die-value">{{ rolling ? '?' : formatDie(d10) }}</span>
          </span>
          <div class="text-xs text-night-400 mt-2">d10</div>
        </div>
        <span class="text-night-400 text-xl pb-4" v-html="'&minus;'" />
        <div>
          <span class="die-face die-night" :class="{'die-rolling': rolling}">
            <span class="die-value">{{ rolling ? '?' : formatDie(d6) }}</span>
          </span>
          <div class="text-xs text-night-400 mt-2">d6</div>
        </div>
        <span class="text-night-400 text-xl pb-4" v-html="'='" />
        <div>
          <span class="die-face die-gilt" :class="{'die-rolling': rolling}">
            <span class="die-value">{{ rolling ? '?' : formatMove }}</span>
          </span>
          <div class="text-xs text-night-400 mt-2">move</div>
        </div>
      </div>

      <ButtonComponent
        type="primary"
        class="w-full my-2 py-2 tracking-widest"
        @click="dramaticRoll"
      >
        Roll for the next prompt
      </ButtonComponent>

      <div class="text-gilt-300 italic" v-if="rollMessage && !rolling">
        {{ rollMessage }}
      </div>

      <div class="mt-1 text-blood-400" v-if="currentPrompt.page && !rolling">
        <strong>Current prompt:</strong> {{ currentPrompt.page }}
        <span v-html="tally(currentPrompt.count)" />
      </div>

      <div class="text-sm text-night-400 mt-1" v-if="lastRoll !== '?'">
        Last roll: {{ lastRoll }}
      </div>
    </div>

    <div v-if="journalEntries.length === 0" class="text-night-400 italic text-center my-4">
      Your story has not yet begun. Roll for your first prompt.
    </div>

    <transition-group
      tag="ul"
      enter-active-class="transition-all duration-100 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <li
        v-for="entry in journalEntries"
        :key="`journal-entry-${entry.id}`"
        class="mb-4 p-4 border rounded"
        :class="{'border-blood-700 bg-blood-950/30': entry.id === currentPrompt.id}"
      >
        <div class="flex justify-between items-center mb-2 select-none">
          <HeadingComponent level="4">
            Prompt {{ entry.page }}
            <span v-html="tally(entry.count)" />
          </HeadingComponent>
          <div class="flex-initial">
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              title="Set as current prompt"
              @click="makePromptCurrent(entry)"
              v-html="'&rarr;'"
              v-show="entry.id !== currentPrompt.id"
            />
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              title="Increment visits"
              @click="incrementPrompt(entry)"
              v-html="'&plus;'"
              v-show="entry.count < 3"
            />
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              title="Decrement visits"
              @click="decrementPrompt(entry)"
              v-html="'&minus;'"
              v-show="entry.count > 1"
            />
            <RemoveCrossComponent
              v-show="entry.id !== currentPrompt.id"
              @remove="removePrompt(entry)"
            />
          </div>
        </div>

        <blockquote class="border-l-2 border-gilt-700 pl-3 my-3 italic text-parchment-400 whitespace-pre-line">
          {{ promptText(entry) || 'Prompt text not yet available.' }}
        </blockquote>

        <textarea
          placeholder="What happened?"
          class="shadow appearance-none border border-night-600 bg-night-900 rounded w-full py-2 px-3 text-parchment-200 placeholder:text-night-400 font-body text-base leading-relaxed focus:outline-hidden focus:ring-2 ring-gilt-600 resize-none"
          rows="4"
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
              class="w-full shadow border border-night-600 bg-night-900 rounded py-1 px-2 m-1 text-parchment-200 leading-tight focus:outline-hidden focus:ring-2 ring-gilt-600"
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
              class="w-full shadow border border-night-600 bg-night-900 rounded py-1 px-2 m-1 text-parchment-200 leading-tight focus:outline-hidden focus:ring-2 ring-gilt-600"
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
          <CheckboxComponent
            v-model="makeCurrent"
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
import RemoveCrossComponent from 'Components/RemoveCrossComponent';
import SlideDownPanelComponent from 'Components/SlideDownPanelComponent';
import CheckboxComponent from 'Components/CheckboxComponent';
import { mapState, mapActions } from 'pinia';
import { useActionsStore } from 'Stores/actions';
import { useNotificationsStore } from 'Stores/notifications';
import { usePromptTextsStore } from 'Stores/promptTexts';
import entityFactory from 'Libs/entities/prompts';

const ROLL_ANIMATION_MS = 600;

export default {
  name: 'JournalPane',
  data() {
    return {
      newPrompt: entityFactory({
        page: 1,
        count: 1,
      }),
      makeCurrent: true,
      rolling: false,
      hasRolled: false,
    };
  },
  components: {
    CardComponent,
    ButtonComponent,
    FormComponent,
    HeadingComponent,
    RemoveCrossComponent,
    SlideDownPanelComponent,
    CheckboxComponent,
  },
  computed: {
      ...mapState(useActionsStore, ['d6', 'd10', 'lastRoll', 'die', 'currentRoll', 'currentPrompt', 'journalEntries']),
      ...mapState(usePromptTextsStore, ['textFor']),
      promptText() {
        // Imported book text wins; the entry's own text field remains as
        // the manual fallback for prompts typed in by hand.
        return (entry) => this.textFor(entry.page, entry.count) || entry.text;
      },
      formatDie() {
        return (value) => isNaN(value) ? '?' : value;
      },
      formatMove() {
        if (isNaN(this.die)) {
          return '?';
        }

        return this.die > 0 ? `+${this.die}` : `${this.die}`;
      },
      rollMessage() {
        if (!this.hasRolled || isNaN(this.die)) {
          return '';
        }

        const page = this.currentPrompt.page;
        const count = this.currentPrompt.count;

        if (this.die > 0) {
          return `The night carries you forward to prompt ${page}.`;
        }

        if (count > 1) {
          return `The past holds you — visit ${count} of prompt ${page}.`;
        }

        return `Three visits exhausted — you move on to prompt ${page}.`;
      },
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
    ...mapActions(useActionsStore, ['roll', 'makePromptCurrent', 'removePrompt', 'addPrompt', 'incrementPrompt', 'decrementPrompt', 'updatePromptEntry']),
    ...mapActions(useNotificationsStore, {
      hideNotification: 'hide',
      showNotification: 'showNotification',
    }),
    dramaticRoll() {
      if (this.rolling) {
        return;
      }

      this.rolling = true;

      setTimeout(() => {
        this.roll();
        this.rolling = false;
        this.hasRolled = true;
      }, ROLL_ANIMATION_MS);
    },
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
