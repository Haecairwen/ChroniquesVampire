<template>
    <span
        class="cursor-pointer select-none mx-1"
        :class="armed ? 'text-blood-500 font-semibold' : 'hover:text-blood-400'"
        :title="armed ? $t('common.confirmRemove') : $t('common.removeItem')"
        @click="onClick"
    >{{ armed ? $t('common.sure') : '×' }}</span>
</template>

<script>
const DISARM_AFTER_MS = 2500;

export default {
  name: 'RemoveCrossComponent',
  emits: ['remove'],
  data() {
    return {
      armed: false,
      disarmTimer: null,
    };
  },
  methods: {
    onClick() {
      if (!this.armed) {
        this.armed = true;
        this.disarmTimer = setTimeout(() => {
          this.armed = false;
        }, DISARM_AFTER_MS);
        return;
      }

      clearTimeout(this.disarmTimer);
      this.armed = false;
      this.$emit('remove');
    },
  },
  beforeUnmount() {
    clearTimeout(this.disarmTimer);
  },
}
</script>
