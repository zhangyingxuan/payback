<template>
  <div class="latestConceptPlate__container container">
    <el-table
      :data="tableData"
      border
      class="table"
      ref="multipleTable"
      header-cell-class-name="table__header"
    >
      <el-table-column label="概念名称" align="left">
        <template #default="scope">
          <Plate :name="scope.row.name" :code="scope.row.code" />
        </template>
      </el-table-column>
      <el-table-column prop="code" label="Code"></el-table-column>

      <el-table-column
        prop="createTime"
        width="220"
        label="创建时间"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { dayjs } from 'element-plus';
import { findConceptPlateByLimit } from '@/api/payBack';
import { useRouter } from 'vue-router';
import { dateTimeFormat } from '@/views/article/config';

const router = useRouter();
const tableData = ref<any[]>([]);
// 获取表格数据
const getData = () => {
  findConceptPlateByLimit({ limit: 15 }).then((data: any) => {
    tableData.value = data.map((item: any) => {
      return {
        ...item,
        createTime: dayjs(item.createTime).format(dateTimeFormat),
      };
    });
  });
};
getData();
</script>

<style scoped lang="less">
.latestConceptPlate__container {
  .handle-box {
    margin-bottom: 20px;
  }

  .table {
    width: 100%;
    font-size: 14px;
  }
}
</style>
