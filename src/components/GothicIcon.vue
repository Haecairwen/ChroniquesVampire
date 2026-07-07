<template>
    <svg
        class="v-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        v-html="markup"
    />
</template>

<script>
// Hand-drawn iconography, one glyph per pane/action. Everything is stroked
// or filled with currentColor so each era theme recolours the set for free.
const ICONS = {
    // Journal: a writing quill above its baseline.
    quill: `
        <path d="M20.6 3.2c-5.2.6-9.7 3.1-12.7 7.6-1.4 2.1-2.4 4.5-2.9 7l1.4.5c1.9-4.9 5-8.9 8.6-11.2-3.2 3-5.9 6.9-7.3 11.7 1.2.4 2.5.5 3.7.2 4.5-1.2 8.2-6.3 9.2-15.8z" fill="currentColor"/>
        <path d="M3.2 21h9.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>`,
    // Memories: a lit taper, memory as a flame kept burning.
    candle: `
        <path d="M12 2.2c1.6 2 2.4 3.5 2.4 4.9A2.4 2.4 0 0 1 12 9.5a2.4 2.4 0 0 1-2.4-2.4c0-1.4.8-2.9 2.4-4.9z" fill="currentColor"/>
        <path d="M9.6 11.4h4.8v8.2a1 1 0 0 1-1 1h-2.8a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9.6 13.2c0 1.4 1.1 1.2 1.1 2.7" fill="none" stroke="currentColor" stroke-width="1"/>
        <path d="M6.8 21.4h10.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
    // Marks: a drop of blood.
    drop: `
        <path d="M12 2.6C8.8 7.8 7 11.2 7 14.2a5 5 0 0 0 10 0c0-3-1.8-6.4-5-11.6z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 8.4c-1.7 2.7-2.5 4.5-2.5 6a2.5 2.5 0 0 0 5 0c0-1.5-.8-3.3-2.5-6z" fill="currentColor"/>`,
    // Skills: a dagger, point raised.
    dagger: `
        <path d="M12 2.2l2.2 8.9h-4.4z" fill="currentColor"/>
        <path d="M12 4.5v6.6" stroke="currentColor" stroke-width=".8" fill="none" opacity=".5"/>
        <path d="M7.4 12.6h9.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <path d="M10.9 14h2.2v3.8h-2.2z" fill="currentColor"/>
        <circle cx="12" cy="19.6" r="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/>`,
    // Resources: a jewelled chalice.
    chalice: `
        <path d="M6 3.4h12c0 4.6-2.2 7.6-6 7.6s-6-3-6-7.6z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path d="M6.4 6.4h11.2" stroke="currentColor" stroke-width=".9" fill="none"/>
        <rect x="10.9" y="7.2" width="2.2" height="2.2" transform="rotate(45 12 8.3)" fill="currentColor"/>
        <path d="M12 11v5.4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M7.6 20.6c0-1.9 2-2.7 4.4-2.7s4.4.8 4.4 2.7z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    // Characters: a masquerade mask.
    mask: `
        <path d="M5 4.4c2.3 1 4.6 1.5 7 1.5s4.7-.5 7-1.5c0 7.2-2.3 12.4-7 15.4-4.7-3-7-8.2-7-15.4z" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 9.7c1-1 2.5-1 3.4 0-.9 1-2.4 1-3.4 0z" fill="currentColor"/>
        <path d="M12.6 9.7c1-1 2.5-1 3.4 0-.9 1-2.4 1-3.4 0z" fill="currentColor"/>
        <path d="M9.6 14.3c1.5 1.2 3.3 1.2 4.8 0" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
    // The house sigil: a bat in flight.
    bat: `
        <path d="M12 6.8c-.7 1.3-1.8 2-3.1 2C7.7 7.2 6 6.4 3.9 6.6c.9 1.1 1.3 2.3 1.2 3.6-1.4.9-2.3 2.2-2.8 3.9 1.8-.7 3.3-.6 4.6.4 1.2.9 2 2.2 2.4 3.9.7-1.4 1.6-2.3 2.7-2.6 1.1.3 2 1.2 2.7 2.6.4-1.7 1.2-3 2.4-3.9 1.3-1 2.8-1.1 4.6-.4-.5-1.7-1.4-3-2.8-3.9-.1-1.3.3-2.5 1.2-3.6-2.1-.2-3.8.6-5 2.2-1.3 0-2.4-.7-3.1-2z" fill="currentColor"/>
        <path d="M10.4 5.4L12 3l1.6 2.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>`,
    // Settings: an old iron key.
    key: `
        <circle cx="7" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="7" cy="12" r="1.2" fill="currentColor"/>
        <path d="M10.6 12h10" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M16.6 12v3.2M20 12v2.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
    // Era themes: an hourglass.
    hourglass: `
        <path d="M6.8 3h10.4M6.8 21h10.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M8.2 3.4c0 3.4 1.5 5.5 3.8 8.6-2.3 3.1-3.8 5.2-3.8 8.6M15.8 3.4c0 3.4-1.5 5.5-3.8 8.6 2.3 3.1 3.8 5.2 3.8 8.6" fill="none" stroke="currentColor" stroke-width="1.3"/>
        <path d="M12 13.6c1.4 1.9 2.3 3.3 2.5 5.2h-5c.2-1.9 1.1-3.3 2.5-5.2z" fill="currentColor"/>`,
    // Diary: an open book.
    book: `
        <path d="M12 5.4C10.3 4 8 3.4 4.5 3.6v13.8c3.5-.2 5.8.4 7.5 1.8 1.7-1.4 4-2 7.5-1.8V3.6C16 3.4 13.7 4 12 5.4z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M12 5.6v13.2" stroke="currentColor" stroke-width="1" fill="none"/>
        <path d="M6.6 7.2c1.5 0 2.7.3 3.6.9M6.6 10c1.5 0 2.7.3 3.6.9M13.8 8.1c.9-.6 2.1-.9 3.6-.9M13.8 10.9c.9-.6 2.1-.9 3.6-.9" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/>`,
    // Night itself.
    moon: `
        <path d="M14.8 3.2a8.2 8.2 0 1 0 6 12.4A9.4 9.4 0 0 1 14.8 3.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M16.6 6.6l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="currentColor"/>`,
};

export const ICON_NAMES = Object.keys(ICONS);

export default {
  name: 'GothicIcon',
  props: {
      name: {
          type: String,
          required: true,
          validator: (name) => ICON_NAMES.includes(name),
      },
  },
  computed: {
      markup() {
          return ICONS[this.name] ?? '';
      },
  },
}
</script>
