<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-select v-model="query.address" placeholder="地址" class="handle-select mr10">
          <el-option key="1" label="广东省" value="广东省"></el-option>
          <el-option key="2" label="湖南省" value="湖南省"></el-option>
        </el-select>
        <el-input v-model="query.name" placeholder="用户名" class="handle-input mr10"></el-input>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
        <el-table-column prop="name" label="用户名"></el-table-column>
        <el-table-column label="账户余额">
          <template #default="scope">￥{{ scope.row.money }}</template>
        </el-table-column>
        <el-table-column label="头像(查看大图)" align="center">
          <template #default="scope">
            <el-image
              class="table-td-thumb"
              :src="scope.row.thumb"
              :z-index="10"
              :preview-src-list="[scope.row.thumb]"
              preview-teleported
            >
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.state === '成功' ? 'success' : scope.row.state === '失败' ? 'danger' : ''">
              {{ scope.row.state }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="date" label="注册时间"></el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)" v-permiss="15"> 编辑 </el-button>
            <el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)" v-permiss="16">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="query.pageIndex"
          :page-size="query.pageSize"
          :total="pageTotal"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import { fetchData } from '@/api/index';
import { useRouter } from 'vue-router';

interface TableItem {
  id: number;
  name: string;
  money: string;
  state: string;
  date: string;
  address: string;
}

const query = reactive({
  address: '',
  name: '',
  pageIndex: 1,
  pageSize: 10,
});
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
// 获取表格数据
const getData = () => {
  fetchData().then(res => {
    tableData.value = res.data.list;
    pageTotal.value = res.data.pageTotal || 50;
  });
};
getData();

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  getData();
};

const router = useRouter();
// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getData();
};

// 删除操作
const handleDelete = (index: number) => {
  // 二次确认删除
  ElMessageBox.confirm('确定要删除吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功');
      tableData.value.splice(index, 1);
    })
    .catch(() => {});
};

let idx = -1;

// 跳转添加新闻页
const handleAdd = () => {
  // 路由跳转
  router.push({ name: 'newsEdit' });
};
const handleEdit = (index: number, row: any) => {
  // 路由跳转
  router.push({
    name: 'newsEdit',
    query: {
      idx: index,
      name: row.name,
      address: row.address,
    },
  });
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #ff0000;
}

.mr10 {
  margin-right: 10px;
}

.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
