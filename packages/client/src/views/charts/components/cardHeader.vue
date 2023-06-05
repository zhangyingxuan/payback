<template>
  <el-row>
    <el-col :span="12"> {{ superData.headerTitle }} </el-col>
    <el-col :span="12" class="headerRight">
      <el-link type="primary" :href="superData.url" target="_blank"
        >更多数据</el-link
      >
      <!-- <a :href="superData.url" target="_blank">更多数据</a> -->
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
const url = ref();
let superData = defineProps({
  headerTitle: {
    type: String,
    default: '默认值',
  },
  url: {
    type: String,
    default: '默认值',
  },
});
</script>

<style scoped>
.headerRight {
  text-align: right;
}
</style>
