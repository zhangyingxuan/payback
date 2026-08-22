<!-- 集合竞价数据 -->
<template>
  <div v-if="!isEmpty(stock)" class="biddingData__row">
    <span
      class="middle"
      :class="{
        'red bold': Number(stock.expected) === 2,
        green: ![1, 2].includes(Number(stock.expected)),
      }"
    >
      {{ stock.bidIncreaseT && (+stock.bidIncreaseT).toFixed(2) }}
      <el-tag
        v-if="isDailyLimit(stock.code, stock.bidIncreaseT)"
        size="small"
        type="warning"
        effect="dark"
        round
        >1
      </el-tag>
    </span>
    <span
      class="middle"
      :class="
        stock.closeIncrease - stock.bidIncreaseT >= 0
          ? 'red bold'
          : stock.closeIncrease < 0
          ? 'green'
          : ''
      "
    >
      <!-- （{{ (stock.closeIncrease - stock.bidIncreaseT).toFixed(2) }}） -->
      {{ stock.closeIncrease }}
    </span>
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
  </div>
</template>
<script lang="ts" setup>
import { calcClassByBidRating, isDailyLimit } from '../../utils';
import { isEmpty } from 'lodash-es';

defineProps({
  stock: {
    type: Object,
    default: () => {},
  },
});

</script>

<style scoped lang="less">
.biddingData__row {
  min-width: 500px;
  > span {
    display: inline-block;
  }
}
</style>
