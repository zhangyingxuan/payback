<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="行业板块" :url="url" />
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
import { fetchHostListData } from '@/api/payBack';
import { onMounted, reactive, watch, computed } from 'vue';
import { isMobile } from '@/core/util';
import { getChartStyle } from './utils/util';
import HotListTable from './components/tabPaneHotListTable.vue';
import dayjs from 'dayjs';

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
});

async function initPageData() {
  const result = await fetchHostListData({ limit: 10, isMobile });
  // 数据转换
  data.hotListResult = result.map(item => {
    return {
      createTime: dayjs(item.updatedTime).format('MM/DD HH:mm'),
      plateIndustry: JSON.parse(item.plateIndustry),
      stockNormal: JSON.parse(item.stockNormal),
      stockValue: JSON.parse(item.stockValue),
      plateConcept: JSON.parse(item.plateConcept),
      // hotEtfs: JSON.parse(item.hotEtfs),
    };
  });
}

initPageData();

onMounted(() => {});
</script>

<style scoped lang="less">
.chartList__container {
  display: flex;
  flex-wrap: wrap;
  padding: 0 5px;

  &.isMobile {
    > .el-card {
      margin-left: 5px;
    }
  }

  > .el-card {
    margin-left: 15px;
  }

  /deep/.el-card__header {
    padding: 5px 10px;
  }
}
</style>
