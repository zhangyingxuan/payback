<!-- // 涨停分类 -->
<!-- 分类 股票（红色：连板 青色： 反包） -->
<!-- 赤橙黄绿青蓝紫 -->
<!-- 封单大于 1亿的 标红 -->
<template>
  <div class="table__header table-row">
    <div class="col1">板块名 ({{ platesLength }})</div>
    <div class="col2">
      <div class="dailyLimit__row">
        <div class="dailyLimit__content">
          <span class="stock large--fixed">个股名</span>
          &nbsp;[&nbsp;
          <span class="content-large">涨停原因</span>
          <span class="lanse middle">股价</span>
          <span class="middle">封单量</span>
          <span class="middle">换手率</span>
          <span class="zise content-middle">流通市值</span>
          <span class="large">涨停时间</span>
          <span class="small text-center lvse">开板数</span>
          ]
          <span class="small red bold">预期</span>
          <!-- <span class="large text-center">封板类型</span> -->
        </div>
        <!-- 竞价行 -->
        <div class="biddingData__row" v-if="showBidding">
          <span class="middle">竞价涨幅</span>
          <span class="middle">竞价预期</span>
          <span>收盘涨幅</span>
          [
          <span class="small">竞价</span>
          <span class="large">竞价评级</span>
          <span class="middle">竞价量比</span>
          ]
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  showBidding: {
    type: Boolean,
    default: true,
  },
  platesLength: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped lang="less">
@import '../../styles/tabPaneEvenBoardStockTable.less';
</style>
