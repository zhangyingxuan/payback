<template>
  <el-popover
    trigger="hover"
    placement="right"
    popper-class="stockOp__popperClass"
    virtual-triggering
    :virtual-ref="virtualRef"
    v-if="isAdmin"
  >
    <template #default>
      <el-button-group class="op__btnGroup">
        <el-button @click="handleAdd" type="primary" :icon="Plus" />
        <el-button @click="handleDel" type="primary" :icon="Minus" />
      </el-button-group>
    </template>
  </el-popover>
</template>
<script lang="ts" setup>
import { addThsSelfStock, delThsSelfStock } from '../api/thsTrade';
import { Plus, Minus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { isAdmin } from '@/store/permiss';

let superData = defineProps({
  virtualRef: {},
  virtualRefData: {
    type: Object,
  },
});

async function handleAdd() {
  const result = await addThsSelfStock({
    code: superData.virtualRefData?.code,
  });
  if (!result) {
    ElMessage({
      showClose: true,
      message: '添加自选成功',
      type: 'success',
    });
  }
}
async function handleDel() {
  const result = await delThsSelfStock({
    code: superData.virtualRefData?.code,
  });
  if (!result) {
    ElMessage({
      showClose: true,
      message: '删除自选成功',
      type: 'success',
    });
  }
}
</script>

<style lang="less">
.stockOp__popperClass {
  padding: 0 !important;
  width: 93px !important;
  min-width: 93px !important;
  background-color: #409eff;
}
</style>
<style scoped lang="less">
.op__btnGroup {
  margin: 0;
}
</style>
