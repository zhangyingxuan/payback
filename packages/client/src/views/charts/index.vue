<template>
  <el-tabs type="border-card" class="reviewBoard__tabs" @tab-change="tabChange">
    <el-tab-pane label="图表复盘">
      <TabPaneCharts />
    </el-tab-pane>
    <el-tab-pane label="短线">
      <TabPaneEvenBoard />
    </el-tab-pane>
    <el-tab-pane label="热榜">
      <TabPaneHotList />
    </el-tab-pane>
    <el-tab-pane label="板块">
      <TabPanePlates />
    </el-tab-pane>
    <!-- <el-tab-pane label="我的自选"> </el-tab-pane> -->
  </el-tabs>
</template>
<script lang="ts" setup>
import TabPaneCharts from './tabPaneCharts.vue';
import TabPaneEvenBoard from './tabPaneEvenBoard.vue';
import TabPaneHotList from './tabPaneHotList.vue';
import TabPanePlates from './tabPanePlates.vue';

// function tabChange(name: string) {
//   console.log(name);
// }
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
