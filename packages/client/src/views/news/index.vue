<template>
  <el-tabs type="border-card">
    <!-- <el-tabs type="border-card" class="reviewBoard__tabs" @tab-change="tabChange"> -->
    <el-tab-pane label="新闻">
      <TabPaneNews ref="news" />
    </el-tab-pane>
    <el-tab-pane label="个股异动">
      <TabChangesStock ref="changesStock" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import TabPaneNews from './news.vue';
import TabChangesStock from './changesStock.vue';
</script>

<style scoped lang="less"></style>
