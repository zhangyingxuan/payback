<!-- 集合竞价数据 -->
<template>
  <div class="dailyLimit__content">
    <Stock
      v-if="stock.evenBoardHeight != 1"
      class="red large--fixed"
      :name="stock.name + '(' + stock.evenBoardHeight + ')'"
      :code="stock.code"
    />
    <Stock v-else class="large--fixed" :name="stock.name" :code="stock.code" />
    &nbsp;[&nbsp;
    <span
      class="orange content-large"
      v-html="highlightKeyWord(stock.reason, keyword)"
    ></span>
    <span class="lanse middle">{{ stock.price }}</span>
    <span
      :class="{
        'red bold': stock.closingFunds > 1,
        middle: true,
      }"
    >
      {{ stock.closingFunds }} 亿
    </span>
    <!-- 换手率 -->
    <span v-if="stock.turnoverRate" :class="calcClass(stock)" class="middle">
      {{ stock.turnoverRate }} %
    </span>
    <span class="zise content-middle"> {{ stock.circulationValue }} 亿 </span>
    <span class="large">
      {{ transformTime(stock.dailyTime) }}
      <!-- 如果是一字涨停，则标注 -->
      <el-tag
        v-if="stock.dailyTime === '09:30:00'"
        size="small"
        type="danger"
        round
        effect="dark"
        >1</el-tag
      >
    </span>
    <span class="lvse small text-center">
      {{ stock.openTimes }}
    </span>
    ]&nbsp;&nbsp;
    <span class="red bold middle">{{ getExpectedStr(stock) }}</span>
    <!-- <span v-if="stock.turnoverType" class="red large">
              {{ stock.turnoverType }}
            </span> -->
  </div>
</template>
<script lang="ts" setup>
import { highlightKeyWord } from '../../utils';
import { getExpected } from 'pay-back-core';

defineProps({
  stock: {
    type: Object,
    default: () => {},
  },
  keyword: {
    type: String,
    default: '',
  },
});

function getExpectedStr(stock: any) {
  // 期待值
  const expected: string = getExpected(stock);
  if (expected.indexOf(',') === -1) {
    return `${expected}`;
  }
  const expectedArr = expected.split(',');
  return `${expectedArr[0]}-${expectedArr[1]}`;
}

/**
 * 处理时间格式，如果秒为0 则去除
 * @param time
 */
function transformTime(time: string): string {
  if (time.indexOf(',') === -1) {
    // 去除秒，如果秒为0
    return (
      time.slice(0, -3) + (time.slice(-2) === '00' ? '' : ':' + time.slice(-2))
    );
  }
  const times = time.split(',');
  const start = transformTime(times[0]);
  const end = transformTime(times[1]);
  return start + ',' + end;
}

/**
 * 根据换手率 标注颜色
 * @param turnoverRate
 */
function calcClass(stock: any) {
  // 仅首板 会加上 颜色区分
  if (stock.evenBoardHeight != 1) {
    return;
  }

  const turnoverRate: number = stock.turnoverRate;
  if (turnoverRate < 5) {
    return 'green';
  }
  if (turnoverRate > 5 && turnoverRate < 10) {
    return 'bold red';
  }
  return '';
}
</script>

<style scoped lang="less">
.dailyLimit__content {
  min-width: 990px;
  overflow: auto;

  /deep/.stock,
  > span {
    display: inline-block;
  }
}
</style>
