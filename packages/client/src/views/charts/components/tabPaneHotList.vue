<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="行业涨跌TOP5"
          url="http://www.iwencai.com/unifiedwap/result?w=行业板块涨跌幅正序；所属同花顺行业级别是二级行业；&querytype=zhishu"
        />
      </template>
      <PlateRiseFallTable
        :data="data.plates"
        :style="data.style"
        :isHangye="true"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="概念涨跌TOP5"
          url="http://www.iwencai.com/unifiedwap/result?w=概念板块主力资金；涨跌幅正序&querytype=zhishu"
        />
      </template>
      <PlateRiseFallTable :data="data.plates" :style="data.style" />
    </el-card>
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
import CardHeader from './cardHeader.vue';
import PlateRiseFallTable from './plateRiseFallTable.vue';
import { fetchHostListData, findPlateByLimit } from '@/api/payBack';
import { onMounted, reactive, watch, computed } from 'vue';
import { isMobile } from '@/core/util';
import HotListTable from './hotListTable.vue';
import dayjs from 'dayjs';

const url = 'https://eq.10jqka.com.cn/frontend/thsTopRank/index.html';

enum HotListKey {
  plateIndustry = 'plateIndustry',
  plateConcept = 'plateConcept',
  stockNormal = 'stockNormal',
  stockValue = 'stockValue',
}

const data: any = reactive({
  ...getChartStyle(),
  hotListResult: {},
  plates: {},
});

function getChartStyle() {
  // 计算宽度；屏幕宽度 - 左侧siderBar - 边框 - cardLeft
  const columnsAmount = 2;
  const screenWidth = screen.width - 200 - columnsAmount * 15;
  const cardWidth = isMobile ? screen.width - 30 : screenWidth / columnsAmount;
  return {
    style: `width: ${cardWidth}px;`,
    styleBig: `width: ${cardWidth}px;`,
  };
}

async function initPageData() {
  const result = await fetchHostListData({ limit: 10, isMobile });
  const plates = await findPlateByLimit({ limit: 10 });
  data.plates = plates.map(plate => {
    return {
      gainianRiseFloat: plate.gainianRiseFloat
        ? JSON.parse(plate.gainianRiseFloat)
        : '',
      gainianFallFloat: plate.gainianFallFloat
        ? JSON.parse(plate.gainianFallFloat)
        : '',
      hangyeRiseFloat: plate.hangyeRiseFloat
        ? JSON.parse(plate.hangyeRiseFloat)
        : '',
      hangyeFallFloat: plate.hangyeFallFloat
        ? JSON.parse(plate.hangyeFallFloat)
        : '',
      createTime: dayjs(plate.createTime).format('MM/DD'),
    };
  });
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
