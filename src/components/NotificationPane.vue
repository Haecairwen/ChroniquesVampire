<template>
    <transition
        enter-active-class="transition-all duration-400 ease-out"
        leave-active-class="transition-all duration-400 ease-in"
        enter-from-class="opacity-0 scale-40"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-40"
    >
        <div :class="classes" v-show="visible">
            <div class="flex-1">
                {{ message }}
            </div>
            <RemoveCrossComponent class="flex-initial" @remove="hide"/>
        </div>
    </transition>
</template>

<script>
import RemoveCrossComponent from 'Components/RemoveCrossComponent';
import { mapState, mapActions } from 'pinia';
import { useNotificationsStore } from 'Stores/notifications';


const TYPES = {
    default: {
        'border-gilt-600': true,
        'bg-night-800': true,
        'text-parchment-200': true,
    },
    danger: {
        'border-blood-600': true,
        'bg-blood-950/70': true,
        'text-blood-200': true,
    },
    warning: {
        'border-gilt-500': true,
        'bg-night-800': true,
        'text-gilt-300': true,
    }
};

var timer = null;

export default {
  name: 'NotificationPane',
  components: {
      RemoveCrossComponent,
  },
  data() { 
    return {
        timeout: 5000,
    }
  },
  computed: {
      ...mapState(useNotificationsStore, ['visible', 'message', 'type']),
      classes() {
          return {
              'sticky': true,
              'inset-6': true,
              'border': true,
              'rounded': true,
              'p-2': true,
              'flex': true,
              ...TYPES[this.type],
          }
      }
  },
  methods: {
      ...mapActions(useNotificationsStore, ['hide']),
  },
  watch: {
      visible(value) {
          clearTimeout(timer);

          if (value) {
            timer = setTimeout(() => {
                this.hide();
            }, this.timeout);
          }
      }
  }
}
</script>