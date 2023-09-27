<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="行业板块" :url="url">
          <el-button
            type="primary"
            @click="updateHotListData"
            size="small"
            :loading="data.loading"
          >
            更新数据
          </el-button>
          <el-button
            type="primary"
            @click="refreshHotListPage"
            size="small"
            plain
            :loading="data.refreshLoading"
          >
            刷新
          </el-button>
        </CardHeader>
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.plateIndustry"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="概念板块" :url="url" />
      </template>

      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.plateConcept"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="热门个股" :url="url" />
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.stockNormal"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="价投个股" :url="url" />
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.stockValue"
        :style="data.style"
      />
    </el-card>
    <el-backtop :visibility-height="100" :right="100" :bottom="100" />
  </div>
</template>
<script lang="ts" setup>
import CardHeader from './components/cardHeader.vue';
import { fetchHostListData, crawlHotListData } from '@/api/payBack';
import { reactive } from 'vue';
import { isMobile } from '@/core/util';
import { getChartStyle } from './utils/util';
import HotListTable from './components/tabPaneHotListTable.vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';

const url = 'https://eq.10jqka.com.cn/frontend/thsTopRank/index.html';

enum HotListKey {
  plateIndustry = 'plateIndustry',
  plateConcept = 'plateConcept',
  stockNormal = 'stockNormal',
  stockValue = 'stockValue',
}

const data: any = reactive({
  ...getChartStyle(isMobile),
  hotListResult: {},
  refreshLoading: false,
  loading: false,
});

async function refreshHotListPage() {
  data.refreshLoading = true;
  const result = await fetchHostListData({ limit: 10, isMobile });
  // 数据转换
  data.hotListResult = result.map(item => {
    return {
      createTime: item.createTime,
      updatedTime: dayjs(item.updatedTime).format('MM/DD HH:mm'),
      plateIndustry: JSON.parse(item.plateIndustry),
      stockNormal: JSON.parse(item.stockNormal),
      stockValue: JSON.parse(item.stockValue),
      plateConcept: JSON.parse(item.plateConcept),
      // hotEtfs: JSON.parse(item.hotEtfs),
    };
  });
  data.refreshLoading = false;
}

/**
 * 爬取最新热榜数据
 */
async function updateHotListData() {
  data.loading = true;
  crawlHotListData()
    .then((result: any) => {
      result.updatedTime = dayjs(result.updatedTime).format('MM/DD HH:mm');
      // 爬取成功
      ElMessage.success('更新成功');
      // refreshHotListPage();
      data.hotListResult.splice(0, 1, result);
    })
    .finally(() => {
      data.loading = false;
    });
}

refreshHotListPage();
</script>

<style scoped lang="less">
.chartList__container {
  display: flex;
  flex-wrap: wrap;
  padding: 0 5px;

  /deep/.el-card__header {
    padding: 5px 10px;
  }
}
</style>
