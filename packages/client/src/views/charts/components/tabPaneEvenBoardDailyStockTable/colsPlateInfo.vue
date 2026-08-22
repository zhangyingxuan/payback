<template>
  <div class="col1__container">
    <div>
      <div
        :class="[
          'zise',
          {
            // 看多的情况，不及预期率小于 30% 且，超预期个股 不等于0
            many:
              incompatibleRate.rate < 0.3 && incompatibleRate.exceededNum > 0,
            less: incompatibleRate.rate > 0.5,
          },
        ]"
      >
        <Plate :name="item.key" /> {{ item.maxHeight }}
      </div>
      <div v-if="item.value.length > 1 && showBidding" class="gray">
        {{ incompatibleRate.exceededNum }}
        {{ incompatibleRate.conformToNum }}
        {{ incompatibleRate.incompatibleNum }}
        {{ incompatibleRate.rate }}
      </div>
    </div>
    <br v-if="isMobile" />
    <div>
      <div>{{ item.closingFundsTotal.toFixed(2) }}</div>
      <div v-if="item.value.length > 1" class="gray stock__num">
        <!-- 符合条件的个股 / 板块总个股数 -->
        <el-tooltip
          effect="dark"
          placement="top"
          content="符合筛选条件的个股 / 板块总个股数"
        >
          {{ item.len }}/{{ item.value.length }}
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  item: {
    type: Object,
    default: () => {},
  },
  incompatibleRate: {
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
  font-weight: 500;
}
.stock__num {
  font-weight: 500;
  cursor: pointer;
}
</style>
