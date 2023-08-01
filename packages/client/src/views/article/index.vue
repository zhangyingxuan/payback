<template>
  <div class="article__container container">
    <div class="handle-box">
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增
      </el-button>

      <el-button class="error-btn" @click="goBack"> 返回 </el-button>
    </div>
    <el-table
      :data="tableData"
      border
      class="table"
      ref="multipleTable"
      header-cell-class-name="table__header"
    >
      <el-table-column label="标题" min-width="200" align="left">
        <template #default="scope">
          <div class="oprate__btn" @click="handleTitleClick(scope.row.id)">
            {{ scope.row.title }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="updatedTime"
        width="220"
        label="更新时间"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        width="220"
        label="创建时间"
      ></el-table-column>
      <el-table-column label="操作" min-width="90" fixed="right">
        <template #default="scope">
          <span
            class="oprate__btn"
            @click="handleEdit(scope.row.id)"
            v-permiss="15"
          >
            编辑
          </span>
          <span
            class="oprate__btn red"
            @click="handleDelete(scope.$index, scope.row.id)"
            v-permiss="16"
          >
            删除
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="basetable">
import { ref } from 'vue';
import { dayjs, ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { ArticleModel } from '@/api/model/ArticleModel';
import { findAll, remove } from '@/api/article';
import { useRouter } from 'vue-router';
import { dateTimeFormat } from './config';

const router = useRouter();
const tableData = ref<ArticleModel[]>([]);
// 获取表格数据
const getData = () => {
  findAll().then((data: any) => {
    tableData.value = data.map((item: any) => {
      return {
        ...item,
        createTime: dayjs(item.createTime).format(dateTimeFormat),
        updatedTime: dayjs(item.updatedTime).format(dateTimeFormat),
      };
    });
  });
};
getData();

// 删除操作
const handleDelete = (index: number, id: number) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      remove({ id }).then(() => {
        ElMessage.success('删除成功');
        tableData.value.splice(index, 1);
      });
    })
    .catch(() => {});
};

// 跳转添加文章页
const handleAdd = () => {
  // 路由跳转
  router.push({ name: 'articleEdit' });
};
const handleEdit = (id: number) => {
  // 路由跳转
  router.push({
    name: 'articleEdit',
    query: {
      id,
    },
  });
};
const handleTitleClick = (id: number) => {
  // 路由跳转
  router.push({
    name: 'articleDetail',
    query: {
      id,
    },
  });
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped lang="less">
.article__container {
  .handle-box {
    margin-bottom: 20px;
  }

  .table {
    width: 100%;
    font-size: 14px;
  }

  .oprate__btn {
    cursor: pointer;
    &:hover {
      color: @blue;
    }
  }
}
</style>
