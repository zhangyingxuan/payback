<template>
  <div class="md__container">
    <div class="left__container">
      <ul>
        <li
          v-for="(fileName, index) in Object.keys(markdownTxts)"
          :key="'mdTitle' + index"
          @click="handleClick(fileName)"
        >
          {{ fileName }}
        </li>
      </ul>
    </div>
    <div class="right__container">
      <!-- <v-md-preview :text="markdownTxt"></v-md-preview> -->
      <component v-bind:is="markdownTxt"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const markdownTxts: any = {};
const files: any = import.meta.globEager('@/assets/docs/md/*.md');
Object.keys(files).forEach(fileName => {
  const name = fileName.replace(/\.\/|\.md/g, '');
  markdownTxts[name] = files[fileName].default;
});

const markdownTxt = ref(Object.values(markdownTxts)[0]);

function handleClick(fileName: string) {
  markdownTxt.value = markdownTxts[fileName];
  console.log(markdownTxts, markdownTxts[fileName]);
}
</script>
<style scoped lang="less">
.md__container {
  display: flex;
  .left__container {
    width: 200px;
  }
  .right__container {
    flex: 1;
  }
}
</style>
