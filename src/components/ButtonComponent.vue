<template>
    <button
        class="py-1 px-4 rounded font-display tracking-wide transition-colors focus:outline-hidden focus:ring-2 ring-0"
        :class="typeClasses"
        @click="$emit('click')"
    >
        <slot />
    </button>
</template>

<script>
const BUTTON_TYPES = {
    default: {
        'bg-night-700': true,
        'hover:bg-night-600': true,
        'text-parchment-200': true,
        'ring-night-500': true,
    },
    primary: {
        'bg-blood-700': true,
        'hover:bg-blood-600': true,
        'text-parchment-50': true,
        'ring-blood-500': true,
    },
    secondary: {
        'bg-gilt-700': true,
        'hover:bg-gilt-600': true,
        'text-night-950': true,
        'ring-gilt-400': true,
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
