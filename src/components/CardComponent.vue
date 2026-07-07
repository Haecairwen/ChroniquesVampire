<template>
  <section class="v-panel">
    <svg
      v-for="corner in CORNERS"
      :key="corner"
      class="v-panel__corner"
      :class="`v-panel__corner--${corner}`"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <!-- Reinforced L-shaped frame edge. -->
      <path d="M46 2.5H12C6 2.5 2.5 6 2.5 12v34" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path d="M46 6.5H13c-4.4 0-6.5 2.1-6.5 6.5v33" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.65" />
      <!-- Corner boss: a set quatrefoil gem. -->
      <g transform="translate(12.5 12.5)">
        <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="none" stroke="currentColor" stroke-width="1.2" />
        <rect x="-2.2" y="-2.2" width="4.4" height="4.4" transform="rotate(45)" fill="currentColor" />
      </g>
      <!-- Thorned scrollwork curling off the edges. -->
      <path d="M24 6.5c3.4 0 5.5-2 5.5-4.5M6.5 24c0 3.4-2 5.5-4.5 5.5" fill="none" stroke="currentColor" stroke-width="1" />
      <path d="M32 2.5c0 3 2.4 4.4 5.4 3.6M2.5 32c3 0 4.4 2.4 3.6 5.4" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.7" />
      <!-- Fleur pointing into the panel. -->
      <path d="M21 21c2.4-.9 4.6-.9 7 0-.9 2.4-.9 4.6 0 7-2.4.9-4.6.9-7 0 .9-2.4.9-4.6 0-7z" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.55" />
    </svg>
    <slot />
  </section>
</template>

<script>
const CORNERS = ['tl', 'tr', 'bl', 'br'];

export default {
  name: 'CardComponent',
  created() {
    this.CORNERS = CORNERS;
  },
}
</script>
