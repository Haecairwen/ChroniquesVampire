<template>
  <div id="actions" class="relative">
    <div class="w-40">
      <ButtonComponent
        class="w-full"
        :type="open ? 'secondary' : 'default'"
        @click="toggle"
      >
        <GothicIcon name="key" />
        {{ $t('menu.button') }}
      </ButtonComponent>
    </div>
    <div
      class="absolute right-0 mt-3 w-80 z-50 v-menu"
      v-show="open"
    >
      <SaveMenuComponent />
      <LoadMenuComponent />
      <PromptImportComponent />
      <SlideDownPanelComponent>
        <template #closed-heading>
          {{ $t('settings.heading') }}
        </template>
        <template #open-heading>
          {{ $t('settings.heading') }}
        </template>
        <div class="flex items-center gap-2 my-2">
          <span class="flex-1">{{ $t('settings.language') }}</span>
          <ButtonComponent
            :type="locale === 'en' ? 'secondary' : 'default'"
            @click="switchLocale('en')"
          >
            EN
          </ButtonComponent>
          <ButtonComponent
            :type="locale === 'fr' ? 'secondary' : 'default'"
            @click="switchLocale('fr')"
          >
            FR
          </ButtonComponent>
        </div>
        <div class="my-2">
          <div class="flex items-center gap-2">
            <GothicIcon name="hourglass" class="text-gilt-400" />
            <span class="flex-1">{{ $t('settings.uiTheme') }}</span>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <ButtonComponent
              v-for="themeId in themes"
              :key="`theme-${themeId}`"
              :type="theme === themeId ? 'secondary' : 'default'"
              @click="switchTheme(themeId)"
            >
              {{ $t(`themes.${themeId}`) }}
            </ButtonComponent>
          </div>
        </div>
      </SlideDownPanelComponent>
      <div class="border-t border-night-600 mt-3 pt-2 text-sm text-night-400 text-right">
        <ul>
          <li>
            <a
              class="hover:text-blood-400"
              href="https://github.com/Haecairwen/ChroniquesVampire"
              v-html="forkCopyright"
            />
          </li>
          <li>
            <a
              class="hover:text-blood-400"
              href="https://github.com/robinmalburn/tyov"
              v-html="'Based on tyov, Copyright &copy; 2021 Robin Malburn'"
            />
          </li>
          <li>
            <a
              class="hover:text-blood-400"
              href="https://thousandyearoldvampire.com/"
              v-html="'Thousand Year Old Vampire Copyright &copy; Tim Hutchings'"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonComponent from './ButtonComponent';
import GothicIcon from './GothicIcon';
import SaveMenuComponent from './SaveMenuComponent';
import LoadMenuComponent from './LoadMenuComponent';
import PromptImportComponent from './PromptImportComponent';
import SlideDownPanelComponent from './SlideDownPanelComponent';
import { setLocale } from '../i18n';
import { AVAILABLE_THEMES, currentTheme, setTheme } from 'Libs/uiTheme';

export default {
  name: 'ActionsPane',
  data() {
    return {
      open: false,
      theme: currentTheme(),
    }
  },
  components: {
    ButtonComponent,
    GothicIcon,
    SaveMenuComponent,
    LoadMenuComponent,
    PromptImportComponent,
    SlideDownPanelComponent,
  },
  computed: {
    locale() {
      return this.$i18n.locale;
    },
    themes() {
      return AVAILABLE_THEMES;
    },
    forkCopyright() {
      // Be a little defensive since we're trusting local clocks, but querying
      // a remote API for the copyright year seemed a bit overkill.
      const year = Math.max(2026, (new Date()).getUTCFullYear());
      return `Chroniques Vampire modifications &copy; ${year} Haecairwen`;
    },
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
    switchLocale(locale) {
      setLocale(locale);
    },
    switchTheme(theme) {
      setTheme(theme);
      this.theme = currentTheme();
    },
  },
}
</script>
