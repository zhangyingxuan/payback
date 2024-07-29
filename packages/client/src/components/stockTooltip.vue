<template>
  <el-tooltip
    :raw-content="true"
    :effect="virtualRefData?.theme || 'dark'"
    :placement="virtualRefData?.placement || 'top'"
    virtual-triggering
    :virtual-ref="virtualRef"
    :content="virtualRefData?.toolTipContent"
    :popper-class="virtualRefData?.popoverClass"
  >
  </el-tooltip>
</template>
<script lang="ts" setup>
defineProps({
  virtualRef: {},
  virtualRefData: {
    type: Object,
  },
});
</script>
