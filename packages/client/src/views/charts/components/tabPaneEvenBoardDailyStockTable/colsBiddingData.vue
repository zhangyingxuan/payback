<!-- 集合竞价数据 -->
<template>
  <div v-if="!_.isEmpty(stock)" class="biddingData__row">
    <span class="middle" :class="{ 'red bold': stock.bidIncreaseT >= 7 }">
      {{ stock.bidIncreaseT && +stock.bidIncreaseT.toFixed(2) }}
      <el-tag
        v-if="isDailyLimit(stock.code, stock.bidIncreaseT)"
        size="small"
        type="warning"
        effect="dark"
        round
        >1
      </el-tag>
    </span>
    <span class="middle" :class="{ 'red bold': stock.expected === 2 }">
      {{ getExpectedStr(stock.expected) }}
    </span>
    <span
      class="middle"
      :class="{
        'red bold': stock.closeIncrease >= 5,
        green: stock.closeIncrease < 0,
      }"
    >
      {{ stock.closeIncrease }}
    </span>
    [
    <span class="small" :class="calcClassByBidRating(stock.bidRating)"
      >{{ stock.bidRating }}
    </span>
    <span
      class="large"
      :class="{
        'red bold':
          stock.bidChangeTypeT === '竞价抢筹' ||
          stock.bidChangeTypeT === '大幅高开',
      }"
    >
      {{ stock.bidChangeTypeT }}&nbsp;
    </span>
    <span class="middle" :class="{ 'red bold': stock.bidVolumeRatio >= 10 }">
      {{ stock.bidVolumeRatio }}
    </span>
    ]
  </div>
</template>
<script lang="ts" setup>
import { calcClassByBidRating, isDailyLimit } from '../../utils';
import _ from 'lodash-es';

defineProps({
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
  min-width: 500px;
  > span {
    display: inline-block;
  }
}
</style>
