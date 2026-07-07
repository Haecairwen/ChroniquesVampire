<template>
  <div id="app" class="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col p-4">
    <NotificationPane class="flex-none" />
    <header class="v-titlebar flex-none">
      <svg class="v-titlebar__rule" viewBox="0 0 200 14" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
        <path d="M0 7h176" stroke="currentColor" stroke-width="1" fill="none" />
        <path d="M0 10.5h150" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6" />
        <path d="M170 7c4-5 10-5 10 0s-6 5-10 0z" fill="none" stroke="currentColor" stroke-width="1" />
        <rect x="190" y="3.5" width="7" height="7" transform="rotate(45 193.5 7)" fill="currentColor" />
      </svg>
      <h1 class="v-titlebar__title">
        <GothicIcon class="v-titlebar__sigil" name="bat" />
        {{ $t('app.title') }}
        <GothicIcon class="v-titlebar__sigil" name="moon" />
      </h1>
      <svg class="v-titlebar__rule" style="transform: scaleX(-1)" viewBox="0 0 200 14" preserveAspectRatio="xMaxYMid meet" aria-hidden="true" focusable="false">
        <path d="M0 7h176" stroke="currentColor" stroke-width="1" fill="none" />
        <path d="M0 10.5h150" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6" />
        <path d="M170 7c4-5 10-5 10 0s-6 5-10 0z" fill="none" stroke="currentColor" stroke-width="1" />
        <rect x="190" y="3.5" width="7" height="7" transform="rotate(45 193.5 7)" fill="currentColor" />
      </svg>
      <ActionsPane class="flex-none" />
    </header>
    <div class="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
      <div class="w-full lg:w-1/2 flex flex-col gap-4 min-h-0">
        <div class="flex-none lg:max-h-[40%] lg:overflow-y-auto">
          <MemoriesPane />
        </div>
        <div class="flex-1 min-h-0 lg:overflow-y-auto">
          <JournalPane class="min-h-full" />
        </div>
      </div>
      <div class="w-full lg:w-1/2 grid grid-cols-1 md:grid-cols-2 lg:grid-rows-2 gap-4 min-h-0">
        <div class="min-h-0 lg:overflow-y-auto">
          <MarksPane class="min-h-full" />
        </div>
        <div class="min-h-0 lg:overflow-y-auto">
          <ResourcesPane class="min-h-full" />
        </div>
        <div class="min-h-0 lg:overflow-y-auto">
          <SkillsPane class="min-h-full" />
        </div>
        <div class="min-h-0 lg:overflow-y-auto">
          <CharactersPane class="min-h-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ActionsPane from "./components/ActionsPane";
import CharactersPane from "./components/CharactersPane";
import GothicIcon from "./components/GothicIcon";
import JournalPane from "./components/JournalPane";
import MarksPane from "./components/MarksPane";
import MemoriesPane from "./components/MemoriesPane";
import NotificationPane from "./components/NotificationPane";
import ResourcesPane from "./components/ResourcesPane";
import SkillsPane from "./components/SkillsPane";

export default {
  name: 'App',
  components: {
    ActionsPane,
    GothicIcon,
    JournalPane,
    MarksPane,
    SkillsPane,
    ResourcesPane,
    CharactersPane,
    MemoriesPane,
    NotificationPane,
  },
}
</script>
