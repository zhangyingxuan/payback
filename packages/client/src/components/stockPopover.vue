<template>
  <el-popover
    trigger="hover"
    placement="right"
    popper-class="stockOp__popperClass"
    virtual-triggering
    :virtual-ref="virtualRef"
    v-if="permiss.isAdmin"
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
import {
  addThsSelfStock,
  delThsSelfStock,
  addThsSelfPlate,
  delThsSelfPlate,
  addThsSelfPlateByNameCn,
  delThsSelfPlateByNameCn,
} from '../api/thsTrade';
import { Plus, Minus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { usePermissStore } from '../store/permiss';

const permiss = usePermissStore();

let superData = defineProps({
  virtualRef: {},
  virtualRefData: {
    type: Object,
  },
});

async function handleAdd() {
  const result = await updateWatchlist(true);
  if (!result) {
    ElMessage({
      showClose: true,
      message: '添加自选成功',
      type: 'success',
    });
  }
}
async function handleDel() {
  const result = await updateWatchlist(false);
  if (!result) {
    ElMessage({
      showClose: true,
      message: '删除自选成功',
      type: 'success',
    });
  }
}

function updateWatchlist(add: boolean) {
  const { code, name, isPlate } = superData.virtualRefData ?? {};
  // 板块分组可能只有名称，交给现有板块接口查找代码。
  if (isPlate) {
    if (code) {
      return (add ? addThsSelfPlate : delThsSelfPlate)({ code: String(code).split('.')[0] });
    }
    return (add ? addThsSelfPlateByNameCn : delThsSelfPlateByNameCn)({ plateNameCn: name });
  }
  return (add ? addThsSelfStock : delThsSelfStock)({ code });
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
  display: inline-flex;
  width: max-content;
  margin: 0;
}
</style>
