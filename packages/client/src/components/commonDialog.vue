<template>
  <!-- 编辑弹出框 -->
  <el-dialog
    :title="superData.title"
    :width="isMobile ? '96%' : superData.width"
    v-model="superData.visible"
    :before-close="handleClose"
    :top="superData.top"
  >
    <slot></slot>
  </el-dialog>
</template>
<script lang="ts" setup>
import { isMobile } from '@/core/util';
let superData = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String || null,
    default: '',
  },
  width: {
    type: String,
    default: '50%',
  },
  top: {
    type: String,
    default: '15vh',
  },
});

const emit = defineEmits(['onClose']);

function handleClose() {
  emit('onClose');
}
</script>

<style scoped lang="less"></style>
