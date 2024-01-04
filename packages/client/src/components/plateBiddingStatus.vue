<template>
  <el-tag
    v-if="incompatibleRate < 0.3"
    class="ml-2"
    type="danger"
    round
    size="small"
  >
    多
  </el-tag>
  <!-- <el-tag
    v-else-if="incompatibleRate > 0.5"
    class="ml-2"
    type="success"
    round
    size="small"
  >
    空
  </el-tag> -->
  <!-- {{ incompatibleRate }} -->
</template>

<script setup lang="ts">
let superData = defineProps({
  stocks: {
    type: Array,
    default: () => [],
  },
});
/**
 * 获取板块 个股 开票预期情况（超预期 / 符合预期 / 不及预期）
 */
function getPlateExpectCondition() {
  let exceededNum = 0,
    conformToNum = 0,
    incompatibleNum = 0;
  superData.stocks &&
    superData.stocks.forEach((stock: any) => {
      const biddingData = stock.biddingData;
      // // 符合预期
      // conformTo = 1,
      // // 超预期
      // exceed = 2,
      // // 不及预期
      // incompatible = 0,
      if (biddingData.expected == 1) {
        conformToNum++;
      } else if (biddingData.expected == 2) {
        exceededNum++;
      } else {
        incompatibleNum++;
      }
    });
  return +(
    incompatibleNum /
    (incompatibleNum + conformToNum + exceededNum)
  ).toFixed(2);
  // return `${exceededNum} / ${conformToNum} / ${incompatibleNum}`;
}

// 不及预期率
const incompatibleRate = getPlateExpectCondition();
</script>

<style scoped lang="less"></style>
