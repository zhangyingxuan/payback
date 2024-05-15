<template>
  <div>
    <el-tag
      class="ml-2"
      :type="superData.tagType"
      >{{ superData.title }}</el-tag
    >
  </div>
  <ul class="iwencaiCollectList__ul">
    <li v-for="(item, index) in superData.urlList" :key="'item' + index">
      <el-link
        :href="
          iwencaiUrl +
          item +
          (superData.type === 'stock'
            ? iwencaiStockBaseWord
            : '&querytype=zhishu')
        "
        type="primary"
        :underline="false"
        icon="Link"
        target="_blank"
      >
        {{ item }}</el-link
      >
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { iwencaiUrl } from '../views/charts/utils/config';
const iwencaiStockBaseWord =
  '，流通市值<=120亿，流通市值>=20亿，行业概念，筹码集中，非创业板，非科创板，非ST&querytype=stock';
let superData = defineProps({
  type: {
    type: String,
    default: 'stock',
  },
  title: {
    type: String,
    default: '',
  },
  tagType: {
    type: String,
    default: 'warning',
  },
  urlList: {
    type: Array,
    default: () => {},
  },
});
</script>

<style scoped lang="less">
.iwencaiCollectList__ul {
  padding-left: 20px;
}
</style>
