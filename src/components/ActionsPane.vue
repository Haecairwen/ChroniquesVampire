<template>
  <div id="actions" class="flex gap-2">
    <div class="w-32">
      <SaveMenuComponent />
    </div>
    <div class="w-32">
      <LoadMenuComponent />
    </div>
  </div>
</template>

<script>
import SaveMenuComponent from './SaveMenuComponent';
import LoadMenuComponent from './LoadMenuComponent';

export default {
  name: 'ActionsPane',
  components: {
    SaveMenuComponent,
    LoadMenuComponent,
  },
}
</script>