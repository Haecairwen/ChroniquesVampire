<template>
  <CardComponent id="journal">
    <HeadingComponent level="2" icon="quill">{{ $t('journal.heading') }}</HeadingComponent>

    <div class="sticky top-0 z-10 text-center border-b border-(--ui-panel-edge) bg-(--ui-well-hi) pb-4 mb-4">
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
          <div class="text-xs text-night-400 mt-2">{{ $t('journal.move') }}</div>
        </div>
      </div>

      <ButtonComponent
        type="primary"
        class="w-full my-2 py-2 tracking-widest"
        @click="dramaticRoll"
      >
        {{ $t('journal.rollButton') }}
      </ButtonComponent>

      <div class="text-gilt-300 italic" v-if="rollMessage && !rolling">
        {{ rollMessage }}
      </div>

      <div class="mt-1 text-blood-400" v-if="currentPrompt.page && !rolling">
        <strong>{{ $t('journal.currentPrompt') }}</strong> {{ currentPrompt.page }}
        <span v-html="tally(currentPrompt.count)" />
      </div>

      <div class="text-sm text-night-400 mt-1" v-if="lastRoll !== '?'">
        {{ $t('journal.lastRoll', { roll: lastRoll }) }}
      </div>
    </div>

    <div v-if="journalEntries.length === 0" class="text-night-400 italic text-center my-4">
      {{ $t('journal.empty') }}
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
            {{ $t('journal.prompt', { page: entry.page }) }}
            <span v-html="tally(entry.count)" />
          </HeadingComponent>
          <div class="flex-initial">
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              :title="$t('journal.setCurrent')"
              @click="makePromptCurrent(entry)"
              v-html="'&rarr;'"
              v-show="entry.id !== currentPrompt.id"
            />
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              :title="$t('journal.incrementVisits')"
              @click="incrementPrompt(entry)"
              v-html="'&plus;'"
              v-show="entry.count < 3"
            />
            <span
              class="cursor-pointer mx-1 hover:text-blood-400"
              :title="$t('journal.decrementVisits')"
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
          {{ promptText(entry) || $t('journal.noText') }}
        </blockquote>

        <textarea
          :placeholder="$t('journal.entryPlaceholder')"
          class="v-input v-input--area m-0 font-body text-base leading-relaxed"
          rows="4"
          :value="entry.entry"
          @change="updatePromptEntry({prompt: entry, entry: $event.target.value})"
        />
      </li>
    </transition-group>

    <SlideDownPanelComponent>
      <template #closed-heading>
        {{ $t('journal.manualAdd') }}
      </template>
      <FormComponent
        @save="validatedAddPrompt"
        @cancel="toggleManualControls"
      >
        <div class="grid grid-rows md:grid-cols-2 gap-2">
          <div class="grid grid-rows gap-2">
            <label for="new-prompt-number">
              {{ $t('journal.promptNumber') }}
            </label>
            <input
              id="new-prompt-number"
              type="number"
              step="1"
              class="v-input"
              v-model="newPrompt.page"
              :min="firstUnusedPrompt"
            />
          </div>
          <div class="grid grid-rows gap-2">
            <label for="new-prompt-count">
              {{ $t('journal.timesVisited') }}
            </label>
            <select
              id="new-prompt-count"
              class="v-input"
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
          {{ $t('journal.current') }}
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
          return this.$t('journal.narrationForward', { page });
        }

        if (count > 1) {
          return this.$t('journal.narrationHeld', { count, page });
        }

        return this.$t('journal.narrationExhausted', { page });
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
        this.showNotification({message: this.$t('journal.duplicatePrompt'), type: 'warning'});
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
