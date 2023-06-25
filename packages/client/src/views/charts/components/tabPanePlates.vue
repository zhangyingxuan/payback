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
  </div>
</template>
<script lang="ts" setup>
import CardHeader from './cardHeader.vue';
import PlateRiseFallTable from './plateRiseFallTable.vue';
import { findPlateByLimit } from '@/api/payBack';
import { reactive } from 'vue';
import { isMobile } from '@/core/util';
import { getChartStyle } from '../utils/util';
import dayjs from 'dayjs';

const data: any = reactive({
  ...getChartStyle(isMobile),
  plates: {},
});
async function initPageData() {
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
}

initPageData();
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
