<template>
  <div class="m-4 p-4 bg-night-800 bg-opacity-60 border border-night-600 rounded shadow-lg hover:shadow-2xl hover:border-gilt-700 transition-all">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CardComponent',
}
</script>