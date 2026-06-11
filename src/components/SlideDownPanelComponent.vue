<template>
    <div :class="classes">
        <ButtonComponent
            class="w-full"
            :type="type"
            @click="toggle"
        >
            <slot
                name="closed-heading"
                v-if="!shouldShow"
            >
                Show
            </slot>

            <slot
                name="open-heading"
                v-else
            >
                Close
            </slot>
        </ButtonComponent>
        <slot v-if="shouldShow" />
    </div>
</template>

<script>
import ButtonComponent from './ButtonComponent';


export default {
  name: 'SlideDownPanelComponent',
  model: {
    prop: 'open',
    event: 'change'
  },
  props: {
      open: {
          type: Boolean,
          default: false,
      }
  },
  data(){
    return {
        isOpen: this.open,
    };
  },
  components: {
      ButtonComponent,
  },
  computed: {
    shouldShow() {
        return this.isOpen;
    },
    type(){
        return this.shouldShow ? 'secondary' : 'default';
    },
    classes() {
          return {
              'my-2' : true,
              'transition-all': true,
              'p-4': this.shouldShow,
              'border': this.shouldShow,
              'rounded': this.shouldShow,
              'border-night-600': this.shouldShow,
              'bg-night-800': this.shouldShow,
              'bg-opacity-40': this.shouldShow,
              'shadow-lg': this.shouldShow,
              'hover:shadow-2xl': this.shouldShow,
          }
      }
  },
  methods: {
      toggle() {
          this.isOpen = !this.isOpen;
          this.$emit('change', this.isOpen);
      }
  },
  watch: {
      open(value) {
          this.isOpen = value;
      }
  }
}
</script>