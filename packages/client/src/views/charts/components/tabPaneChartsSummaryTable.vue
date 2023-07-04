<!-- 汇总表格 -->
<!-- 市场：日期、赚钱效应、亏钱效应、评分、北向南向；（+-5%的个股数量）最近节日倒计时 -->
<!-- 短线：涨停、跌停、连板、最强板块、最强概念 -->
<!-- 板块：涨幅、资金、热度 -->
<!-- 个股：最高股、资金流入top3（换手率是否可参考），总龙头、板块龙头、补涨龙、先锋龙、卡位龙 -->
<!-- <el-card shadow="hover" class="mgb15" style="width: 100%">
      <el-tag size="large" type="success">机会</el-tag>
    </el-card> -->
<template>
  <div class="reviewTable__container">
    <el-descriptions
      title=""
      :direction="superData.isMobile ? 'vertical' : 'horizontal'"
      :size="superData.isMobile ? 'small' : 'large'"
      border
      :column="superData.isMobile ? 4 : 5"
    >
      <el-descriptions-item
        v-for="(item, index) in superData.dataList"
        :label="item.label"
        :key="index"
        min-width="70"
        >{{ item.value }}</el-descriptions-item
      >
    </el-descriptions>
  </div>
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

<style scoped lang="less">
.reviewTable__container {
  margin: 0 15px 20px 15px;
}
</style>
