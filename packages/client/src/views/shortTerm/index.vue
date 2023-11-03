<template>
  <div class="shortTerm__container">
    <TabPaneEvenBoard />
  </div>
</template>
<script lang="ts" setup>
import TabPaneEvenBoard from '../charts/tabPaneEvenBoard.vue';

// function tabChange(name: string) {
//   console.log(name);
// }
</script>

<style scoped lang="less">
.shortTerm__container {
  background-color: #fff;
  padding: 10px 0;
}
</style>
