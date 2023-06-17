<template>
  <el-tabs type="border-card" class="reviewBoard__tabs">
    <el-tab-pane label="图表复盘">
      <TabPaneCharts />
    </el-tab-pane>
    <el-tab-pane label="热榜">
      <TabPaneHotList />
    </el-tab-pane>
    <el-tab-pane label="连板">
      <TabPaneEvenBoard />
    </el-tab-pane>
    <el-tab-pane label="板块">
      <TabPanePlates />
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import TabPaneCharts from './components/tabPaneCharts.vue';
import TabPaneEvenBoard from './components/tabPaneEvenBoard.vue';
import TabPaneHotList from './components/tabPaneHotList.vue';
import TabPanePlates from './components/tabPanePlates.vue';
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
