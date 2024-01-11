<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="涨停最多的行业板块"
          :url="'http://www.iwencai.com/unifiedwap/result?w='+params.hangyePlateOrderByDailyLimitNum+'&querytype=zhishu'"
        >
          {{ data.latestUpdateTimeOrderByDailyLimit }}
        </CardHeader>
      </template>
      <PlateRiseFallTable
        :data="data.plateOrderByDailyLimit"
        :style="data.style"
        :dataKey="['hangyeDailyLimitData']"
      />
    </el-card>

    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="涨停最多的概念板块"
          :url="'http://www.iwencai.com/unifiedwap/result?w='+params.gainianPlateOrderByDailyLimitNum+'&querytype=zhishu'"
        >
          <!-- url="http://www.iwencai.com/unifiedwap/result?w=概念板块主力资金；涨跌幅正序&querytype=zhishu" -->
          {{ data.latestUpdateTimeOrderByDailyLimit }}
        </CardHeader>
      </template>
      <PlateRiseFallTable
        :data="data.plateOrderByDailyLimit"
        :style="data.style"
        :dataKey="['gainianDailyLimitData']"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="行业涨跌TOP5"
          :url="'http://www.iwencai.com/unifiedwap/result?w='+params.hangyeRiseFloat+'&querytype=zhishu'"
        >
          {{ data.latestUpdateTime }}
        </CardHeader>
      </template>
      <PlateRiseFallTable
        :data="data.plates"
        :style="data.style"
        :dataKey="['hangyeRiseFloat', 'hangyeFallFloat']"
      />
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="概念涨跌TOP5"
          :url="'http://www.iwencai.com/unifiedwap/result?w='+params.gainianRiseFloat+'&querytype=zhishu'"
        >
          {{ data.latestUpdateTime }}
        </CardHeader>
      </template>
      <PlateRiseFallTable
        :data="data.plates"
        :style="data.style"
        :dataKey="['gainianRiseFloat', 'gainianFallFloat']"
      />
    </el-card>
  </div>
</template>
<script lang="ts" setup>
import CardHeader from './components/cardHeader.vue';
import PlateRiseFallTable from './components/tabPanePlatesPlateRiseFallTable.vue';
import { findPlateByLimit, fetchPlateOrderByDailyLimit } from '@/api/payBack';
import { reactive } from 'vue';
import { isMobile } from '@/core/util';
import { objectToArr, arrToObject } from './utils';
import { getChartStyle } from './utils';
import dayjs from 'dayjs';
import { params } from 'pay-back-core';

const data: any = reactive({
  ...getChartStyle(isMobile),
  plates: {},
  hangyeDailyLimitData: {},
  latestUpdateTime: '',
  latestUpdateTimeOrderByDailyLimit: '',
});
async function initPageData() {
  let plates = await findPlateByLimit({ limit: 10 });
  let plateOrderByDailyLimit = await fetchPlateOrderByDailyLimit({ limit: 10 });

  data.latestUpdateTime = dayjs(plates[0].createTime).format('MM/DD HH:mm');
  data.latestUpdateTimeOrderByDailyLimit = dayjs(
    plateOrderByDailyLimit[0].createTime,
  ).format('MM/DD HH:mm');

  plates = plates.map(plate => {
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
      createTime: plate.createTime,
      createDate: dayjs(plate.createTime).format('MM/DD'),
    };
  });
  plateOrderByDailyLimit = plateOrderByDailyLimit.map(plate => {
    return {
      ...plate,
      gainianDailyLimitData: plate.gainianDailyLimitData
        ? JSON.parse(plate.gainianDailyLimitData)
        : '',
      hangyeDailyLimitData: plate.hangyeDailyLimitData
        ? JSON.parse(plate.hangyeDailyLimitData)
        : '',
      createTime: plate.createTime,
      createDate: dayjs(plate.createTime).format('MM/DD'),
    };
  });
  updateDataClass(plates, true);
  updateDataClass(plates, false);

  data.plates = plates;
  data.plateOrderByDailyLimit = plateOrderByDailyLimit;
}

function sortAndSetColor(arr: any, from: number) {
  const maxLen = 5;
  // 排序，取出top3 的key
  arr.sort((a: any, b: any) => {
    return b.value - a.value;
  });

  arr = arr.splice(0, maxLen);
  for (let i = 0; i < maxLen; i++) {
    arr[i].value = 'plate' + (from + i);
  }
  return arr;
}

function updateDataClass(plates: any[], isHangye: boolean) {
  let riseKey: string, fallKey: string;
  if (isHangye) {
    riseKey = 'hangyeRiseFloat';
    fallKey = 'hangyeFallFloat';
  } else {
    riseKey = 'gainianRiseFloat';
    fallKey = 'gainianFallFloat';
  }
  // 遍历板块、标注 出现次数最多的TOP3
  let typeRise: any = {},
    typeFall: any = {};
  plates.forEach(dateData => {
    dateData[riseKey].forEach((plate: any) => {
      if (!typeRise[plate.code]) {
        typeRise[plate.code] = 1;
      }
      typeRise[plate.code]++;
    });
    dateData[fallKey].forEach((plate: any) => {
      if (!typeFall[plate.code]) {
        typeFall[plate.code] = 1;
      }
      typeFall[plate.code]++;
    });
  });
  // 对象转数组
  const plateRiseArr: any[] = sortAndSetColor(objectToArr(typeRise), 1),
    plateFallArr: any[] = sortAndSetColor(objectToArr(typeFall), 6);
  const plateRiseObj = arrToObject(plateRiseArr);
  const plateFallObj = arrToObject(plateFallArr);
  plates.forEach(dateData => {
    dateData[riseKey].forEach((plate: any) => {
      plateRiseObj[plate.code] && (plate.class = plateRiseObj[plate.code]);
    });
    dateData[fallKey].forEach((plate: any) => {
      plateFallObj[plate.code] && (plate.class = plateFallObj[plate.code]);
    });
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
