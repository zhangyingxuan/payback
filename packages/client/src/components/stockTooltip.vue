import { default } from '../../../server/src/pay-back/utils/marketUtil';
<template>
  <el-tooltip
    :raw-content="true"
    :effect="virtualRefData?.theme || 'dark'"
    :placement="virtualRefData?.placement || 'top'"
    virtual-triggering
    :virtual-ref="virtualRef"
    :content="superData.virtualRefData?.toolTipContent"
    popper-class="tooltip__popper"
  >
  </el-tooltip>
</template>
<script lang="ts" setup>
let superData = defineProps({
  virtualRef: {},
  virtualRefData: {
    type: Object,
  },
});
</script>

<style lang="less">
.tooltip__popper {
  width: 50%;
}
</style>
