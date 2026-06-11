<template>
  <div id="app" class="h-screen overflow-hidden flex flex-col p-4">
    <NotificationPane class="flex-none" />
    <div class="flex-none flex justify-end">
      <ActionsPane />
    </div>
    <div class="flex flex-row flex-1 gap-4 min-h-0">
      <div class="w-1/2 flex flex-col gap-4 min-h-0">
        <div class="flex-none max-h-2/5 overflow-y-auto">
          <MemoriesPane />
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto">
          <JournalPane />
        </div>
      </div>
      <div class="w-1/2 grid grid-cols-2 gap-4 min-h-0">
        <div class="min-h-0 overflow-y-auto">
          <MarksPane />
          <SkillsPane />
        </div>
        <div class="min-h-0 overflow-y-auto">
          <ResourcesPane />
          <CharactersPane />
        </div>
      </div>
    </div>
    <div class="flex-none border-t mt-4 text-right text-sm text-night-400">
      <ul>
        <li>
          <a
            class="hover:text-blood-400"
            href="https://www.version1.net/"
            v-html="copyright"
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
  computed: {
    copyright() {
      // Be a little defensive since we're trusting local clocks, but querying
      // a remote API for the copyright year seemed a bit overkill.
      const year = Math.max(2021, (new Date()).getUTCFullYear());
      return `Copyright &copy; ${year} Robin Malburn`
    }
  },
}
</script>
