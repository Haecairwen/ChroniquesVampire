# Chroniques Vampire

A [companion web app](https://haecairwen.github.io/ChroniquesVampire/) for the excellent solo RPG [Thousand Year Old Vampire by Tim Hutchings](https://thousandyearoldvampire.com/), forked from [robinmalburn/tyov](https://github.com/robinmalburn/tyov) and reworked with a gothic interface, an integrated dice tray, prompt text import, and a French/English interface.

**▶ Play it here: <https://haecairwen.github.io/ChroniquesVampire/>**

The app runs entirely in your browser — your game is autosaved to local storage as you play, and nothing ever leaves your machine.

## Features

### Journal & dice tray
An integrated d10 − d6 dice roller resolves your next prompt using this fork's house rule:

- A **positive** roll moves you forward that many prompts, at visit 1.
- A **zero or negative** roll keeps you on the current prompt and advances its visit count, up to 3 visits.
- Once 3 visits are exhausted, another non-positive roll moves you forward a single prompt.

Each roll is narrated in the journal, every visited prompt gets its own entry to write in, and prompts can also be added or adjusted manually (visit tally, current-prompt marker, removal).

### Prompt text import
From the hidden top-right menu you can import the Prompts section of your own copy of the book (pasted as plain text, or as a `.txt` file). The journal then shows the actual prompt text for each page and visit (1a/1b/1c), instead of just the prompt number. The imported text is stored locally as reference data, separate from your saves — so save files stay small and shareable.

### Memories, events & diaries
Memory slots with a visual tracker (gain or lose capacity as prompts dictate), up to three events per memory, forgetting and recovering, diarising memories into a capacity-limited diary, and permanently cementing ("publishing") a memory so it no longer occupies a slot.

### Characters, skills, marks & resources
Add and edit everything the game tracks: characters (with bio, immortal and deceased states), skills (with check toggles), marks, and resources (lost/stationary states, plus diaries with at-a-glance capacity).

### Save & load
Beyond the automatic local-storage autosave, you can save and load your game to local storage or to a portable file from the hidden menu at any time.

### Français / English
The interface is fully bilingual. The language is picked up from your browser on first visit and can be switched at any time from the Settings section of the hidden menu.

## Tech stack

Vue 3, Pinia, Tailwind CSS 4, vue-i18n, built with Vite and tested with Vitest (250+ unit tests).

## Development

```sh
npm install        # install dependencies
npm run dev        # dev server with hot reload
npm run test:unit  # run the unit tests
npm run lint       # lint the codebase
npm run build      # production build (served under /ChroniquesVampire/)
npm run preview    # preview the production build locally
```

Pushes to `master` are automatically deployed to GitHub Pages by the `GH Pages` workflow.

## Credits

- Based on [tyov](https://github.com/robinmalburn/tyov), © 2021 Robin Malburn (MIT).
- [Thousand Year Old Vampire](https://thousandyearoldvampire.com/) © Tim Hutchings. This app is an unofficial companion tool; it contains no game text — you import prompts from your own copy of the book.
- Chroniques Vampire modifications © Haecairwen.
- The optional Cathedral theme composites public-domain and CC BY-SA imagery from Wikimedia Commons; see [`src/assets/cathedral/CREDITS.md`](src/assets/cathedral/CREDITS.md) for full attribution.
