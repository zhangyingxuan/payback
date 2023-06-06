<template>
  <el-tabs type="border-card" class="reviewBoard__tabs">
    <el-tab-pane label="图表复盘">
      <chartsTabPane />
    </el-tab-pane>
    <el-tab-pane label="连板">
      <EvenBoardTable />
    </el-tab-pane>
    <el-tab-pane label="热榜"></el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import chartsTabPane from './components/chartsTabPane.vue';
import EvenBoardTable from './components/evenBoardTable.vue';
</script>

<style scoped lang="less">
// 复盘看板
.reviewBoard__tabs {
  // .el-tabs el-tabs--top {
  // }
  /deep/.el-tabs__content {
    padding: 15px 0;
  }
}
</style>
