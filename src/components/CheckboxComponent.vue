<template>
    <input
        type="checkbox"
        class="shadow border border-night-600 bg-night-900 rounded py-2 px-2 m-1 text-parchment-200 leading-tight focus:outline-hidden focus:ring-2 ring-gilt-600"
        :checked="value === trueValue"
        v-bind="$attrs"
        @change="$emit('change', $event.target.checked ? trueValue : falseValue)"
    />
</template>

<script>
export default {
  name: 'CheckboxComponent',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // String must come before Boolean in these types: with Boolean first,
    // Vue 2 casts empty-string values to true, which would corrupt
    // non-boolean models such as the diary id binding.
    value: {
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
}
</script>
