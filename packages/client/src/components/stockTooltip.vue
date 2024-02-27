<template>
  <el-tooltip
    effect="dark"
    placement="top"
    virtual-triggering
    :virtual-ref="virtualRef"
    :content="superData.virtualRefData?.toolTipContent"
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

<style lang="less"></style>
