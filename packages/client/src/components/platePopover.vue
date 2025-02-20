<template>
  <el-popover
    trigger="hover"
    placement="right"
    popper-class="plateOp__popperClass"
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
import { addThsSelfPlate, delThsSelfPlate, addThsSelfPlateByNameCn, delThsSelfPlateByNameCn } from '../api/thsTrade';
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
  const addApi = superData.virtualRefData?.code ? addThsSelfPlate : addThsSelfPlateByNameCn;
  const result = await addApi({
    code: superData.virtualRefData?.code,
    plateNameCn: superData.virtualRefData?.name,
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
  const delApi = superData.virtualRefData?.code ? delThsSelfPlate : delThsSelfPlateByNameCn;
  const result = await delApi({
    code: superData.virtualRefData?.code,
    plateNameCn: superData.virtualRefData?.name,
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
.plateOp__popperClass {
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
