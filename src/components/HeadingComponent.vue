<template>
    <component
        :is="tag"
        class="font-display font-semibold leading-loose tracking-widest text-gilt-400"
        :class="sizeClass"
    >
        <slot />
    </component>
</template>

<script>
const HEADING_STYLES = [
    'text-3xl',
    'text-2xl',
    'text-xl',
    'text-base',
    'text-sm',
    'text-sm',
];

export default {
  name: 'HeadingComponent',
  props: {
      level: {
          type: String,
          default: '1',
          validator: (level) => ['1', '2', '3', '4', '5', '6'].includes(level),
      }
  },
  computed: {
      clampedLevel() {
          return Math.min(6, Math.max(1, this.level));
      },
      tag() {
          return `h${this.clampedLevel}`;
      },
      sizeClass() {
          return HEADING_STYLES[this.clampedLevel - 1];
      },
  },
}
</script>
