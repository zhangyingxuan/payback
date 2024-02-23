<template>
  <div :class="['chartList__container', { isMobile }]">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          headerTitle="涨停最多的行业板块"
          :url="
            'https://www.iwencai.com/unifiedwap/result?w=' +
            params.hangyePlateOrderByDailyLimitNum +
            '&querytype=zhishu'
          "
        >
          <el-button
            v-isAdmin
            type="primary"
            @click="updateData"
            size="small"
            :loading="data.loading"
          >
            更新数据
          </el-button>
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
          :url="
            'https://www.iwencai.com/unifiedwap/result?w=' +
            params.gainianPlateOrderByDailyLimitNum +
            '&querytype=zhishu'
          "
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
          :url="
            'https://www.iwencai.com/unifiedwap/result?w=' +
            params.hangyeRiseFloat +
            '&querytype=zhishu'
          "
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
          :url="
            'https://www.iwencai.com/unifiedwap/result?w=' +
            params.gainianRiseFloat +
            '&querytype=zhishu'
          "
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
import {
  findPlateByLimit,
  fetchPlateOrderByDailyLimit,
  crawlPlateData,
} from '@/api/payBack';
import { reactive } from 'vue';
import { isMobile } from '@/core/util';
import { objectToArr, arrToObject } from './utils';
import { getChartStyle } from './utils';
import dayjs from 'dayjs';
import { params } from 'pay-back-core';
import { ElMessage } from 'element-plus';

const data: any = reactive({
  ...getChartStyle(isMobile),
  plates: [],
  plateOrderByDailyLimit: [],
  latestUpdateTime: '',
  latestUpdateTimeOrderByDailyLimit: '',
  loading: false,
});

/**
 * 初始化 按资金排序的板块
 */
async function initPlateByFunds() {
  let plates = await findPlateByLimit({ limit: 10 });
  data.latestUpdateTime = dayjs(plates[0].createTime).format('MM/DD HH:mm');

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

  updateDataClass(plates, true);
  updateDataClass(plates, false);

  data.plates = plates;
}
/**
 * 初始化 按涨停家数 排序的板块
 */
async function initPlateOrderByDailyLimit() {
  let plateOrderByDailyLimit = await fetchPlateOrderByDailyLimit({ limit: 10 });
  data.latestUpdateTimeOrderByDailyLimit = dayjs(
    plateOrderByDailyLimit[0].createTime,
  ).format('MM/DD HH:mm');

  plateOrderByDailyLimit = plateOrderByDailyLimit.map(plate => {
    return transformDailyLimitDataToObj(plate);
  });
  data.plateOrderByDailyLimit = plateOrderByDailyLimit;
}

async function initPageData() {
  initPlateByFunds();
  initPlateOrderByDailyLimit();
}

function transformDailyLimitDataToObj(plate: any) {
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

/**
 * 更新涨停家数较多的 板块数据
 */
async function updateData() {
  data.loading = true;
  const todayPlatesData: any = await crawlPlateData();
  data.loading = false;
  const todayDate = dayjs(todayPlatesData.createTime).format('YYYY/MM/DD');
  // 按时间找到 今天的行业 数据，并替换为最新的
  const latestDataIndex = data.plateOrderByDailyLimit.findIndex(
    (plate: any) => {
      const currentDate = dayjs(plate.createTime).format('YYYY/MM/DD');
      return currentDate === todayDate;
    },
  );
  data.latestUpdateTimeOrderByDailyLimit = dayjs(
    todayPlatesData.createTime,
  ).format('MM/DD HH:mm');
  if (latestDataIndex === -1) {
    data.plateOrderByDailyLimit.unshift(
      transformDailyLimitDataToObj(todayPlatesData),
    );
  } else {
    data.plateOrderByDailyLimit.splice(
      latestDataIndex,
      1,
      transformDailyLimitDataToObj(todayPlatesData),
    );
  }
  ElMessage.success('更新成功');
}

initPageData();

//暴露state和play方法
defineExpose({
  initPlateByFunds,
});
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
