<template>
  <CardComponent id="actions">
    <HeadingComponent level="2">Game</HeadingComponent>

    <SaveMenuComponent />

    <LoadMenuComponent />
  </CardComponent>
</template>

<script>
import CardComponent from './CardComponent';
import HeadingComponent from './HeadingComponent';
import SaveMenuComponent from './SaveMenuComponent';
import LoadMenuComponent from './LoadMenuComponent';

export default {
  name: 'ActionsPane',
  components: {
    CardComponent,
    HeadingComponent,
    SaveMenuComponent,
    LoadMenuComponent,
  },
}
</script>