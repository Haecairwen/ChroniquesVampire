<template>
    <button
        class="v-btn"
        :class="typeClasses"
        @click="$emit('click')"
    >
        <slot />
    </button>
</template>

<script>
const BUTTON_TYPES = {
    default: {},
    primary: {
        'v-btn--primary': true,
    },
    secondary: {
        'v-btn--secondary': true,
    },
}
export default {
  name: 'ButtonComponent',
  // Declaring the click emit keeps the listener from also falling through
  // via $attrs to the native button, which would fire handlers twice.
  emits: ['click'],
  props: {
      type: {
          type: String,
          default: 'default',
          validator: (type) => Object.keys(BUTTON_TYPES).includes(type)
      }
  },
  computed: {
      typeClasses() {
          return BUTTON_TYPES[this.type];
      }
  }
}
</script>
