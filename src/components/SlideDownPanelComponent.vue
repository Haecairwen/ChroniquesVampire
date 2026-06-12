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
                {{ $t('common.show') }}
            </slot>

            <slot
                name="open-heading"
                v-else
            >
                {{ $t('common.close') }}
            </slot>
        </ButtonComponent>
        <slot v-if="shouldShow" />
    </div>
</template>

<script>
import ButtonComponent from './ButtonComponent';


export default {
  name: 'SlideDownPanelComponent',
  props: {
      modelValue: {
          type: Boolean,
          default: false,
      }
  },
  emits: ['update:modelValue'],
  data(){
    return {
        isOpen: this.modelValue,
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
              'bg-night-800/40': this.shouldShow,
              'shadow-lg': this.shouldShow,
              'hover:shadow-2xl': this.shouldShow,
          }
      }
  },
  methods: {
      toggle() {
          this.isOpen = !this.isOpen;
          this.$emit('update:modelValue', this.isOpen);
      }
  },
  watch: {
      modelValue(value) {
          this.isOpen = value;
      }
  }
}
</script>