<template>
    <input
        type="checkbox"
        class="v-checkbox"
        :checked="modelValue === trueValue"
        v-bind="$attrs"
        @change="$emit('update:modelValue', $event.target.checked ? trueValue : falseValue)"
    />
</template>

<script>
export default {
  name: 'CheckboxComponent',
  inheritAttrs: false,
  props: {
    // String must come before Boolean in these types: with Boolean first,
    // Vue casts empty-string values to true, which would corrupt
    // non-boolean models such as the diary id binding.
    modelValue: {
      type: [String, Boolean],
      default: false,
    },
    // Mirrors the native checkbox true-value/false-value bindings, so
    // non-boolean models (e.g. a diary id or empty string) keep working.
    trueValue: {
      type: [String, Boolean],
      default: true,
    },
    falseValue: {
      type: [String, Boolean],
      default: false,
    },
  },
  emits: ['update:modelValue'],
}
</script>
