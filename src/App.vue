<template>
  <div id="app" class="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col p-4">
    <NotificationPane class="flex-none" />
    <div class="flex-none flex justify-end">
      <ActionsPane />
    </div>
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
