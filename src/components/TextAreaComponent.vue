<template>
    <textarea
        class="shadow appearance-none border border-night-600 bg-night-900 rounded w-full py-1 px-2 m-1 text-parchment-200 placeholder:text-night-400 leading-tight focus:outline-hidden focus:ring-2 ring-gilt-600 resize-none"
        :value="modelValue"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>

<script>
export default {
  name: 'TextAreaComponent',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
}
</script>
