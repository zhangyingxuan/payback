<!-- 集合竞价数据 -->
<template>
  <div v-if="stock" class="biddingData__row">
    [
    <span class="small" :class="calcClassByBidRating(stock.bidRating)"
      >{{ stock.bidRating }}
    </span>
    <span
      class="middle"
      :class="{
        'red bold':
          stock.bidChangeTypeT === '竞价抢筹' ||
          stock.bidChangeTypeT === '大幅高开',
      }"
    >
      {{ stock.bidChangeTypeT }}&nbsp;
    </span>
    <span class="large" :class="{ 'red bold': stock.bidVolumeRatio >= 10 }">
      竞价量比 {{ stock.bidVolumeRatio }}
    </span>
    <span class="large" :class="{ 'red bold': stock.bidIncreaseT >= 7 }">
      竞价涨幅
      {{ stock.bidIncreaseT && +stock.bidIncreaseT.toFixed(2) }}
    </span>
    ] -
    <span class="middle" :class="{ 'red bold': stock.expected === 2 }">{{
      getExpectedStr(stock.expected)
    }}</span>
    收盘涨幅
    <span
      :class="{
        'red bold': stock.closeIncrease >= 5,
        green: stock.closeIncrease < 0,
      }"
      >{{ stock.closeIncrease }}</span
    >
  </div>
</template>
<script lang="ts" setup>
import { calcClassByBidRating } from '../utils';

let superData = defineProps({
  stock: {
    type: Object,
    default: () => {},
  },
});

function getExpectedStr(expected: number) {
  if (expected === 1) {
    return '符合预期';
  }
  if (expected === 2) {
    return '超预期';
  }
  return '不及预期';
}
</script>

<style scoped lang="less">
.biddingData__row {
  min-width: 520px;
  > span {
    display: inline-block;
  }
}
</style>
