<!-- 汇总表格 -->
<!-- 市场：日期、赚钱效应、亏钱效应、评分、北向南向；（+-5%的个股数量）最近节日倒计时 -->
<!-- 短线：涨停、跌停、连板、最强板块、最强概念 -->
<!-- 板块：涨幅、资金、热度 -->
<!-- 个股：最高股（换手率是否可参考） -->
<!-- <el-card shadow="hover" class="mgb15" style="width: 100%">
      <el-tag size="large" type="success">机会</el-tag>
    </el-card> -->
<template>
  <el-descriptions
    title=""
    :size="superData.isMobile ? 'small' : 'large'"
    border
  >
    <el-descriptions-item
      v-for="(item, index) in superData.dataList"
      :label="item.label"
      :key="index"
      >{{ item.value }}</el-descriptions-item
    >
  </el-descriptions>
</template>
<script lang="ts" setup>
let superData = defineProps({
  dataList: {
    type: Array<{ label: string; value: string }>,
    default: () => [],
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
