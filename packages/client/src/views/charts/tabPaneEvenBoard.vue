<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <TabPaneChartsSummaryTable
    v-if="data.hasSummaryTableData"
    :dataList="data.summaryTableData"
    :isMobile="isMobile"
  />
  <div class="table">
    <div class="table__container">
      <!-- 第一列，title -->
      <div :class="['date-col first-col', { isMobile }]">
        <div class="table__header">高度</div>
        <div class="table-col height1">周期</div>
        <!-- <div class="table-col height1">市场</div> -->
        <div class="table-col height1">连板数</div>
        <div class="table-col height1">涨停</div>
        <div class="table-col height1">封板率</div>
        <!-- <div class="table-col height1">炸板率</div> -->
        <div class="table-col height1 green">跌停</div>
        <div class="table-col">其它</div>
        <template v-for="height in heightArr" :key="'row1' + height">
          <div
            :class="['table-col', getClassByHeight(height)]"
            v-if="height != 1"
          >
            {{ height }}
          </div>
          <div v-else class="table-col height1">首板</div>
        </template>
        <div class="table-col downLimitStock__plate">跌停股</div>
      </div>

      <!-- 内容列，循环展示 -->
      <div
        :class="[
          'date-col',
          { isMobile },
          { isMonday: judgeMonday(item.createDate) },
        ]"
        v-for="(item, index) in evenBoard.value"
        :key="'evenBoard' + index"
      >
        <!-- 日期列 -->
        <div
          :class="[
            'table__header',
            { isActive: item.createDate === data.currentDate },
          ]"
          @click="handleDateClick(item)"
        >
          {{ item.createDate }}
          <el-icon>
            <SuccessFilled />
          </el-icon>
        </div>

        <div class="table-col height1">
          <el-tag class="ml-2" :type="getType(item.cycle)" effect="dark">{{
            item.cycle
          }}</el-tag>
        </div>
        <div class="table-col height1">{{ item.evenBoardAmount }}</div>
        <div
          class="table-col height1"
          :class="{ gray: item.dailyLimitQuantity < 50 }"
        >
          {{ item.dailyLimitQuantity }}
        </div>
        <!-- 封板率 -->
        <div
          class="table-col height1"
          :class="{ green: item.sealingRate < 70 }"
        >
          {{ item.sealingRate }}%
        </div>
        <div class="table-col height1 green">{{ item.downLimitQuantity }}</div>
        <!-- 高标数据 -->
        <div class="table-col">
          <el-tooltip
            effect="dark"
            placement="top"
            v-for="(stock, index) in item.evenBoardData.gaobiao"
            :content="stock.reason"
            :key="'stock' + index"
          >
            <span>
              <Stock :name="stock.name" :code="stock.code" />
              <span class="gray">{{ stock.evenDays }}</span>
            </span>
          </el-tooltip>
        </div>
        <template v-for="height in heightArr">
          <div
            :class="['table-col', getClassByHeight(height)]"
            v-if="height != 1"
            :key="'row' + height"
          >
            <el-tooltip
              effect="dark"
              placement="top"
              v-for="(stock, index) in item.evenBoardData[height]"
              :content="stock.reason"
              :key="'stock' + index"
            >
              <Stock :name="stock.name" :code="stock.code" />
            </el-tooltip>
          </div>
          <div v-else class="table-col height1">
            <span v-if="item.evenBoardData && item.evenBoardData[1]">{{
              item.evenBoardData[1].length
            }}</span>
          </div>
        </template>
        <!-- 跌停数据 -->
        <div class="table-col">
          <el-tooltip
            effect="dark"
            placement="top"
            v-for="(stock, index) in item.downLimitData"
            :content="stock.plateLevel2"
            :key="'downLimitStock' + index"
          >
            <span>
              <Stock :name="stock.name" :code="stock.code" />
              <span
                v-if="!isMobile"
                class="downLimitStock__plate"
                type="success"
                >{{ stock.plateLevel2 }}</span
              >
            </span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>

  <!-- 当日涨停分布，按行业板块划分 -->
  <DailyStockTable :data="data.currentDateData" :isMobile="isMobile" />
  <DownStockTable :data="data.currentDateData" :isMobile="isMobile" />
</template>
<script lang="ts" setup>
import { fetchEvenBoardData, fetchReveiwDataByDate } from '@/api/payBack';
// import { fetchIndustryData } from '@/api/tonghuashun';
import { judgeMonday } from './utils';
import { transformEvenBoardData } from './utils/transformUtil';
import { onMounted, reactive, watch, computed } from 'vue';
import { useSidebarStore } from '@/store/sidebar';
import { storeToRefs } from 'pinia';
import { isMobile } from '@/core/util';
import TabPaneChartsSummaryTable from './components/tabPaneChartsSummaryTable.vue';
import DailyStockTable from './components/tabPaneEvenBoardDailyStockTable.vue';
import DownStockTable from './components/tabPaneEvenBoardDownStockTable.vue';
import dayjs from 'dayjs';

type EvenBoard = {
  maxHeight: number;
  createDate: String;
};
let evenBoard = reactive<any>({ value: [] });

const data: {
  currentDateData: any;
  currentDate: string;
  summaryTableData: any[];
  hasSummaryTableData: boolean;
} = reactive({
  hasSummaryTableData: false,
  currentDateData: {},
  currentDate: dayjs().format('MM/DD'),
  summaryTableData: [
    {
      label: '短线周期',
      value: '高潮',
    },
    {
      label: '时间周期',
      value: '',
    },
    {
      label: '市场评分',
      value: '',
    },
    {
      label: '大盘情绪',
      value: '',
    },
    {
      label: '总龙头',
      value: '',
    },
    {
      label: '板块龙头',
      value: '',
    },
    {
      label: '最强题材',
      value: '',
    },
    {
      label: '最强板块',
      value: '',
    },
    // {
    //   label: '人气股',
    //   value: '热榜TOP10除涨停外个股',
    // },
    // {
    //   label: '资金青睐个股',
    //   value: '资金净流入top3 + 板块',
    // },
  ],
});

const siderBar = useSidebarStore();
const { countDays } = storeToRefs(siderBar);

// 监听变化，重新请求数据
watch(countDays, async val => {
  await initPage(val);
});

function getType(cycle: string) {
  if (cycle.indexOf('高潮') > -1) {
    return 'danger';
  }
  if (cycle.indexOf('冰点') > -1) {
    return 'success';
  }
  if (cycle.indexOf('启动') > -1) {
    return 'warning';
  }
  return 'info';
}

async function initPage(pageSize: number) {
  // 获取图表数据
  const result: any = await fetchEvenBoardData({
    // limit: 10,
    limit: isMobile ? 10 : pageSize,
    isMobile,
  });
  // const rs: any = await fetchIndustryData();
  evenBoard.value = transformEvenBoardData(result);
  // 将当日涨停个股，按连板高度、行业 做成表格
  handleDateClick(evenBoard.value[0]);
}

onMounted(() => {
  initPage(countDays.value);
});

async function handleDateClick(item: any) {
  data.currentDate = item.createDate;
  data.currentDateData = evenBoard.value.find(
    (evenBoardItem: any) => evenBoardItem.createDate === item.createDate,
  );
  // 获取复盘数据
  const result: any = await fetchReveiwDataByDate({ date: item.createTime });
  if (!result) {
    data.hasSummaryTableData = false;
    return;
  }
  data.hasSummaryTableData = true;
  data.summaryTableData[0].value = result.cycle ? result.cycle : getDateCycle();
  data.summaryTableData[1].value = getDateCycle();
  data.summaryTableData[2].value = result.marketScore;
  data.summaryTableData[3].value = result.marketMood;
  data.summaryTableData[4].value = result.totalLeader;
  data.summaryTableData[5].value = result.plateLeader;
  data.summaryTableData[6].value = result.strongestPlate;
  data.summaryTableData[7].value = result.strongestTopic;
}

const heightArr = computed(() => {
  let maxHeight = 0;
  // 找出 日期范围内 最高连板
  evenBoard.value.forEach((item: EvenBoard) => {
    maxHeight = item.maxHeight > maxHeight ? item.maxHeight : maxHeight;
  });

  const heightArr = [];
  for (let i = maxHeight; i >= 1; i--) {
    heightArr.push(i);
  }

  return heightArr;
});

function getClassByHeight(height: any) {
  switch (height) {
    case 2:
      return 'height2';
    case 3:
      return 'height3';
    case 4:
    case 5:
    case 6:
      return 'height4';
    case 7:
    case 8:
    default:
      return 'height7';
  }
}

// ========================================================================
const now = dayjs();

/**
 * 获取时间周期
 */
function getDateCycle() {
  const day = now.date();
  if (day >= 1 && day <= 10) {
    return '月初';
  } else if (day > 10 && day <= 20) {
    return '月中';
  } else {
    return '月末';
  }
}
</script>

<style scoped lang="less">
@tableColumsBorderColor: #dcdcdc;
.tableColumsBorder {
  border-right: 1px solid @tableColumsBorderColor;
  border-bottom: 1px solid @tableColumsBorderColor;
}
.tableContentBorder {
  border-left: 1px solid @tableColumsBorderColor;
  border-top: 1px solid @tableColumsBorderColor;
}
.table {
  padding: 0 15px;
  margin-bottom: 10px;
}
.table * {
  box-sizing: border-box;
}

.flexCenter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
}

.table__container {
  overflow: auto;
  display: flex;
  flex-direction: row;
  text-align: center;
  border-left: 1px solid @tableColumsBorderColor;
  // .tableContentBorder();

  .date-col {
    .flexCenter();
    justify-content: flex-start;
    // width: 9%;
    // min-width: 9%;
    // max-width: 9%;
    min-width: 130px;
    // white-space: nowrap;

    &.first-col {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      font-weight: 500;
      position: sticky;
      left: 0;
      background-color: #fff;
    }
    &.isMobile {
      width: 62px;
      min-width: 62px;
      .isActive {
        /deep/.el-icon {
          display: none;
        }
      }
      > div {
        padding: 2px;
      }

      .gray {
        display: inline-block;
      }
    }

    &.isMonday {
      border-right: 2px double #5a9cf8;
      .table__header {
        background-color: #5a9cf8;
        color: #fff !important;
      }
    }

    > div {
      padding: 5px;
    }
  }

  .table__header {
    background-color: #dcdcdc;
    width: 100%;
    cursor: pointer;
    .tableColumsBorder();
    border-top: 1px solid @tableColumsBorderColor;

    &.isActive {
      color: #5a9cf8;
      > .el-icon {
        display: inline-block;
      }
    }
    > .el-icon {
      margin-bottom: -4px;
      display: none;
    }
  }
  .table-col {
    width: 100%;
    height: 83px;
    overflow: scroll;
    // flex: 1;
    .flexCenter();
    .tableColumsBorder();
    justify-content: flex-start;

    &.height2 {
      height: 110px;
    }
    &.height3 {
      height: 75px;
    }
    &.height4 {
      height: 50px;
      color: rgb(163, 5, 5);
    }
    &.height7,
    &.height1 {
      padding: 0px;
      height: 30px;
      // color: rgb(96, 3, 3);
      color: rgb(216, 26, 61);
      justify-content: center;

      > span {
        line-height: 22px;
      }
      &.green {
        color: @green;
      }
      &.gray {
        color: @gray;
      }
    }
  }
  .table-col > span {
    font-size: 12px;
    display: inline-block;
    cursor: pointer;
    /* scale: 0.6; */
    /* transform: scale(0.7);
  transform-origin: 100% 100%; */
  }

  .downLimitStock__plate {
    padding: 2px;
    color: rgb(45, 182, 136);
  }
}
</style>
