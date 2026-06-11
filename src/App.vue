<template>
  <div id="app" class="h-screen overflow-hidden flex flex-col p-4">
    <HeadingComponent level="1" class="flex-none text-center">TYOV ~ Companion</HeadingComponent>
    <NotificationPane class="flex-none" />
    <div class="flex flex-row flex-1 gap-4 min-h-0">
      <div class="w-2/3 min-h-0 overflow-y-auto">
        <JournalPane />
      </div>
      <div class="w-1/3 min-h-0 overflow-y-auto">
        <ActionsPane />
        <MarksPane />
        <SkillsPane />
        <ResourcesPane />
        <CharactersPane />
        <MemoriesPane />
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
import HeadingComponent from "./components/HeadingComponent";
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
    HeadingComponent,
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
