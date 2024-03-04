<template>
  <div class="col1__container">
    <div>
      <div
        :class="[
          'zise',
          {
            many: incompatibleRate.rate < 0.3,
            less: incompatibleRate.rate > 0.5,
          },
        ]"
      >
        {{ item.key }}
      </div>
      <div v-if="item.value.length > 1 && showBidding" class="gray">
        {{ incompatibleRate.exceededNum }}
        {{ incompatibleRate.conformToNum }}
        {{ incompatibleRate.incompatibleNum }}
      </div>
    </div>
    <br v-if="isMobile" />
    <div>
      <div>{{ item.closingFundsTotal.toFixed(2) }}</div>
      <div v-if="item.value.length > 1" class="gray" style="font-weight: 500">
        {{ item.len }}/{{ item.value.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
let props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  showBidding: {
    type: Boolean,
    default: false,
  },
});
/**
 * 获取板块 个股 开票预期情况（超预期 / 符合预期 / 不及预期）
 */
function getPlateExpectCondition() {
  let exceededNum = 0,
    conformToNum = 0,
    incompatibleNum = 0;
  props.item.value &&
    props.item.value.forEach((stock: any) => {
      const biddingData = stock.biddingData;
      // // 符合预期
      // conformTo = 1,
      // // 超预期
      // exceed = 2,
      // // 不及预期
      // incompatible = 0,
      if (biddingData && biddingData.expected == 1) {
        conformToNum++;
      } else if (biddingData && biddingData.expected == 2) {
        exceededNum++;
      } else {
        incompatibleNum++;
      }
    });
  return { incompatibleNum, conformToNum, exceededNum };
}

// 不及预期率
const incompatibleRate = computed(() => {
  const { incompatibleNum, conformToNum, exceededNum } =
    getPlateExpectCondition();

  const rate = props.showBidding
    ? +(
        incompatibleNum /
        (incompatibleNum + conformToNum + exceededNum)
      ).toFixed(2)
    : 0.5;
  return {
    incompatibleNum,
    conformToNum,
    exceededNum,
    rate,
  };
});
</script>

<style scoped lang="less">
.col1__container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.many {
  color: @red;
  font-weight: 500;
  font-size: 14px;
}

.less {
  color: @green;
  font-size: 14px;
  font-weight: 500;
}
</style>
