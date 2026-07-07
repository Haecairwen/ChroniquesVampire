<template>
    <component
        :is="tag"
        class="v-heading"
        :class="[`v-heading--${clampedLevel}`, { 'v-heading--ornate': ornate }]"
    >
        <template v-if="ornate">
            <svg
                class="v-heading__flourish"
                viewBox="0 0 64 12"
                preserveAspectRatio="xMaxYMid meet"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M0 6h44" stroke="currentColor" stroke-width="1" fill="none" />
                <path d="M0 9h30" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6" />
                <path d="M40 6c3-4.2 8-4.2 8 0s-5 4.2-8 0z" fill="none" stroke="currentColor" stroke-width="0.9" />
                <rect x="55.4" y="3.4" width="5.2" height="5.2" transform="rotate(45 58 6)" fill="currentColor" />
            </svg>
            <GothicIcon
                class="v-heading__icon"
                :name="icon"
                v-if="icon"
            />
            <span class="v-heading__text"><slot /></span>
            <svg
                class="v-heading__flourish v-heading__flourish--right"
                viewBox="0 0 64 12"
                preserveAspectRatio="xMaxYMid meet"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M0 6h44" stroke="currentColor" stroke-width="1" fill="none" />
                <path d="M0 9h30" stroke="currentColor" stroke-width="0.6" fill="none" opacity="0.6" />
                <path d="M40 6c3-4.2 8-4.2 8 0s-5 4.2-8 0z" fill="none" stroke="currentColor" stroke-width="0.9" />
                <rect x="55.4" y="3.4" width="5.2" height="5.2" transform="rotate(45 58 6)" fill="currentColor" />
            </svg>
        </template>
        <template v-else>
            <GothicIcon
                class="v-heading__icon"
                :name="icon"
                v-if="icon"
            />
            <slot />
        </template>
    </component>
</template>

<script>
import GothicIcon from 'Components/GothicIcon';

export default {
  name: 'HeadingComponent',
  components: {
      GothicIcon,
  },
  props: {
      level: {
          type: String,
          default: '1',
          validator: (level) => ['1', '2', '3', '4', '5', '6'].includes(level),
      },
      icon: {
          type: String,
          default: '',
      },
  },
  computed: {
      clampedLevel() {
          return Math.min(6, Math.max(1, this.level));
      },
      tag() {
          return `h${this.clampedLevel}`;
      },
      // Top-level headings get the full plaque treatment with flanking
      // scrollwork; deeper levels stay plain engraved text.
      ornate() {
          return this.clampedLevel <= 2;
      },
  },
}
</script>
