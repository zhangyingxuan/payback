<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="行业板块" />
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.plateIndustry"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="概念板块" />
      </template>

      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.plateConcept"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="热门个股" />
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.stockNormal"
        :style="data.style"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader headerTitle="价投个股" />
      </template>
      <HotListTable
        :data="data.hotListResult"
        :type="HotListKey.stockValue"
        :style="data.style"
      />
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import { fetchHostListData } from '@/api/payBack';
import { onMounted, reactive, watch, computed } from 'vue';
import { isMobile } from '@/core/util';
import HotListTable from './hotListTable.vue';
import dayjs from 'dayjs';

enum HotListKey {
  plateIndustry = 'plateIndustry',
  plateConcept = 'plateConcept',
  stockNormal = 'stockNormal',
  stockValue = 'stockValue',
}

const data: any = reactive({
  ...getChartStyle(),
  hotListResult: {},
});

function getChartStyle() {
  // 计算宽度；屏幕宽度 - 左侧siderBar - 边框 - cardLeft
  const columnsAmount = 2;
  const screenWidth = screen.width - 200 - columnsAmount * 15;
  const cardWidth = isMobile ? screen.width - 40 : screenWidth / columnsAmount;
  return {
    style: `width: ${cardWidth}px;`,
    styleBig: `width: ${cardWidth}px;`,
  };
}

async function initPageData() {
  const result = await fetchHostListData({ limit: 10 });
  // 数据转换
  data.hotListResult = result.map(item => {
    return {
      createTime: dayjs(item.createTime).format('MM/DD'),
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
