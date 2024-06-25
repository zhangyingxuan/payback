<template>
  <!-- 10日连板梯队 -->
  <!-- 行数取决于 时间范围内 最高连板 -->
  <!-- 列数取决于 日期数量 -->
  <TabPaneChartsSummaryTable
    v-if="data.hasSummaryTableData"
    :dataList="data.summaryTableData"
    :isMobile="isMobile"
  />

  <div :class="['evenBoard__table', { isMobile }]">
    <!-- 第一列，title -->
    <div :class="['date-col first-col', { isMobile }]">
      <div
        class="table__header link"
        @click="
          () => {
            data.isShowContent = !data.isShowContent;
          }
        "
      >
        {{ data.isShowContent ? '收起' : '展开' }}
        <el-checkbox v-if="!isMobile" v-model="data.showOp"></el-checkbox>
      </div>
      <div v-show="data.isShowContent" class="dynamic__col">
        <div class="table-col height1">周期</div>
        <div class="table-col height1">晋级率</div>
        <!-- <div class="table-col height1">市场</div> -->
        <div class="table-col height1">连板数</div>
        <div class="table-col height1">涨停</div>
        <div class="table-col height1">一字</div>
        <div class="table-col height1">封板率</div>
        <!-- <div class="table-col height1">炸板率</div> -->
        <div class="table-col height1 green">跌停</div>
        <div class="table-col height1 green">大面</div>
        <div class="table-col">反包</div>
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
    </div>

    <!-- 内容列，循环展示 -->
    <div
      :class="[
        'date-col',
        { isMobile },
        { isMonday: judgeMonday(item.createTime) },
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

      <div v-show="data.isShowContent" class="dynamic__col">
        <!-- 周期 -->
        <div class="table-col height1">
          <el-tag class="ml-2" :type="getType(item.cycle)" effect="dark">{{
            item.cycle
          }}</el-tag>
        </div>
        <!-- 连板晋级率=今日连板家数/昨日涨停家数。 -->
        <div
          class="table-col height1"
          :class="{
            green:
              calPromotionRate(item.evenBoardAmount, evenBoard.value, index) <
              20,
          }"
        >
          {{ calPromotionRate(item.evenBoardAmount, evenBoard.value, index) }}%
        </div>
        <!-- 连板数 -->
        <div class="table-col height1">{{ item.evenBoardAmount }}</div>
        <!-- 涨停数量 -->
        <div
          class="table-col height1"
          :class="{ gray: item.dailyLimitQuantity < 50 }"
        >
          {{ item.dailyLimitQuantity }}
        </div>
        <!-- 一字 -->
        <div class="table-col height1">
          {{ item.yizi }}
        </div>
        <!-- 封板率 -->
        <div
          class="table-col height1"
          :class="{ green: item.sealingRate < 70 }"
        >
          {{ item.sealingRate }}%
        </div>
        <!-- 跌停数 -->
        <div class="table-col height1 green">
          {{ item.downLimitQuantity }}
        </div>
        <!-- 大面数量 -->
        <div class="table-col height1 green">
          {{
            item.hugeFallQuantity
              ? item.hugeFallQuantity
              : item.hugeFallData
              ? item.hugeFallData.length
              : 0
          }}
        </div>
        <!-- 反包 -->
        <div class="table-col">
          <span
            v-for="(stock, index) in item.evenBoardData.gaobiao"
            :key="'stock' + index"
          >
            <Stock
              :showTooltip="true"
              :toolTipContent="stock.reason"
              :showOp="data.showOp"
              :name="stock.name"
              :code="stock.code"
            />
            <span class="gray" style="display: inline-block">
              {{ stock.evenDays }}
            </span>
          </span>
        </div>
        <template v-for="(height, index) in heightArr" :key="index">
          <div
            :class="['table-col', getClassByHeight(height)]"
            v-if="height != 1"
            :key="'row' + height"
          >
            <Stock
              v-for="(stock, index) in item.evenBoardData[height]"
              :key="'stock' + index"
              :showTooltip="true"
              :toolTipContent="stock.reason"
              :showOp="data.showOp"
              :name="stock.name"
              :code="stock.code"
            />
          </div>
          <div v-else class="table-col height1">
            <span v-if="item.evenBoardData && item.evenBoardData[1]">{{
              item.evenBoardData[1].length
            }}</span>
          </div>
        </template>
        <!-- 跌停数据 -->
        <div class="table-col">
          <span
            v-for="(stock, index) in item.downLimitData"
            :key="'downLimitStock' + index"
          >
            <Stock
              :showTooltip="true"
              :toolTipContent="stock.reason"
              :showOp="data.showOp"
              :name="stock.name"
              :code="stock.code"
            />
            <span
              v-if="!isMobile"
              class="downLimitStock__plate"
              type="success"
              >{{ stock.plateLevel2 }}</span
            >
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- 集合竞价情况 -->
  <div class="flex__row">
    <!-- 新股 -->
    <NewStockTable
      :propsData="data.currentDateData.newStock"
      :updateTime="data.currentDateData.specialDataUpdateTime"
      :isMobile="isMobile"
      @refreshData="handleRefreshData"
    />
    <!-- 一进2 -->
    <ChoosedStockTable
      :propsData="data.currentDateData.chooseStock"
      :updateTime="data.currentDateData.specialDataUpdateTime"
      :isMobile="isMobile"
      @refreshData="handleRefreshData"
    />
  </div>
  <!-- 昨日涨停竞价情况 -->
  <DailyStockTable
    v-model:currentDateData="data.yesterdayDateData"
    v-model:updateTime="data.currentDateData.biddingDataUpdateTime"
    :isMobile="isMobile"
    title="昨日- 涨停竞价"
    :showBidding="true"
    @refreshData="handleRefreshData"
  />
  <!-- 当日涨停分布，按行业板块划分 -->
  <DailyStockTable
    v-model:currentDateData="data.currentDateData"
    :updateTime="dayjs(data.currentDateData.createTime).format('MM/DD HH:mm')"
    :isMobile="isMobile"
    @refreshData="handleRefreshData"
  />
  <div :class="{ flex__row: !isMobile }">
    <DownStockTable
      :downLimitData="data.currentDateData.downLimitData"
      :num="data.currentDateData.downLimitQuantity"
      :isMobile="isMobile"
      :updateTime="dayjs(data.currentDateData.createTime).format('MM/DD HH:mm')"
    />
    <DownStockTable
      :downLimitData="data.currentDateData.hugeFallData"
      :num="
        data.currentDateData.hugeFallData
          ? data.currentDateData.hugeFallData.length
          : 0
      "
      :isDownLimitMode="false"
      :isMobile="isMobile"
      :updateTime="dayjs(data.currentDateData.createTime).format('MM/DD HH:mm')"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  fetchEvenBoardData,
  crawlBinddingData,
  crawlSpecialStockData,
  crawlTodayData,
} from '@/api/payBack';
// import { fetchIndustryData } from '@/api/tonghuashun';
import { judgeMonday } from './utils';
import { ElMessage } from 'element-plus';
import { transformEvenBoardData } from './utils/transformUtil';
import { reactive, watch, computed } from 'vue';
import { useSidebarStore } from '@/store/sidebar';
import { storeToRefs } from 'pinia';
import { isMobile } from '@/core/util';
import TabPaneChartsSummaryTable from './components/tabPaneChartsSummaryTable.vue';
import DailyStockTable from './components/tabPaneEvenBoardDailyStockTable/index.vue';
import DownStockTable from './components/tabPaneEvenBoardDownStockTable.vue';
import NewStockTable from './components/tabPaneEvenBoardNewStockTable.vue';
import ChoosedStockTable from './components/tabPaneEvenBoardChoosedStockTable.vue';
import dayjs from 'dayjs';

let loadingMessage: any = null;
type EvenBoard = {
  maxHeight: number;
  createDate: string;
};
let evenBoard = reactive<any>({ value: [] });

const data: {
  isShowContent: boolean;
  currentDateData: any;
  yesterdayDateData: any;
  currentDate: string;
  summaryTableData: any[];
  hasSummaryTableData: boolean;
  showOp: boolean;
  virtualRef: any;
  virtualRefData: any;
} = reactive({
  isShowContent: true,
  showOp: false,
  hasSummaryTableData: false,
  currentDateData: {},
  yesterdayDateData: {},
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
  virtualRef: null,
  virtualRefData: null,
});

const sideBar = useSidebarStore();
const { countDays, isAutoRefresh } = storeToRefs(sideBar);
let interval: any = null;

// 监听变化，重新请求数据
watch(
  countDays,
  async val => {
    await initPage(val);
  },
  { immediate: true },
);
// 监听变化，重新请求数据
watch(
  isAutoRefresh,
  async val => {
    initAutoRefresh(val);
  },
  { immediate: true },
);

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
    limit: pageSize,
    isMobile,
  });
  // const rs: any = await fetchIndustryData();
  evenBoard.value = transformEvenBoardData(result);
  // 将当日涨停个股，按连板高度、行业 做成表格
  handleDateClick(evenBoard.value[0]);
}

function initAutoRefresh(val: boolean) {
  if (val) {
    interval = setInterval(() => {
      initPage(countDays.value);
    }, 300000);
  } else {
    clearInterval(interval);
  }
}

/**
 * 刷新短线/竞价数据
 * @param isRefreshBidding  是否刷新竞价数据
 */
async function handleRefreshData(
  isRefreshBidding = true,
  isRemoveIncompatible = 0,
) {
  loadingMessage && loadingMessage.close();
  // 提示加载中
  loadingMessage = ElMessage({
    duration: 0,
    message: '数据更新中...',
    type: 'warning',
  });
  try {
    // 更新 竞价
    if (isRefreshBidding) {
      await refreshBinddingData(isRemoveIncompatible);
    } else {
      await refreshShortTermData();
    }

    ElMessage.success('更新成功！');
  } catch (e: any) {
    console.log(e);
    ElMessage.success('更新失败！');
  } finally {
    loadingMessage.close();
  }
}

/**
 * 刷新竞价数据
 * @param isRemoveIncompatible
 */
async function refreshBinddingData(isRemoveIncompatible = 0) {
  // 根据更新范围，调用对应接口
  const res: any = await crawlBinddingData({
    isRemoveIncompatible, // 不删除不及预期个股
  });
  const eventData = transformEvenBoardData([res]);
  // 修改父组件传过来的值；
  data.yesterdayDateData = eventData[0];
  data.currentDateData.biddingDataUpdateTime = dayjs(
    res.biddingDataUpdateTime,
  ).format('MM/DD HH:mm');

  crawlSpecialStockData({}).then((specialStockData: any) => {
    // 调用另外一个接口 2024-05-10
    // 更新新股 和 强势股 2024-01-07
    data.currentDateData.newStock = JSON.parse(specialStockData.newStock);
    data.currentDateData.chooseStock = JSON.parse(specialStockData.chooseStock);
    data.currentDateData.specialDataUpdateTime = dayjs(res.updateTime).format(
      'MM/DD HH:mm',
    );
  });
}
/**
 * 刷新短线数据
 */
async function refreshShortTermData() {
  // 更新 短线数据
  const res: any = await crawlTodayData({
    fetchTodayDataType: 1,
  });

  const eventData = transformEvenBoardData([res]);

  // - 判断是否为第一次更新,按日期判断
  if (
    dayjs(evenBoard.value[0].createDate).isSame(dayjs(eventData[0].createDate))
  ) {
    // 非第一次更新
    // 备份今日数据
    const temp = JSON.parse(JSON.stringify(data.currentDateData));
    // 更新顶部表格
    evenBoard.value[0] = eventData[0];
    // 更新展开内容 短线部分
    data.currentDateData = eventData[0];
    // 保留 竞价原来的部分
    data.currentDateData.biddingDataUpdateTime = temp.biddingDataUpdateTime;
    data.currentDateData.newStock = temp.newStock;
    data.currentDateData.chooseStock = temp.chooseStock;
  } else {
    // 第一次新增
    // 更新顶部表格
    evenBoard.value.push(eventData[0]);
    // 更新展开内容 短线部分
    data.currentDateData = eventData[0];
    // 还需获取竞价数据
    await handleRefreshData(true);
    initPage(countDays.value);
  }
}

/**
 * 计算晋级率
 * @param evenBoardAmount
 * @param evenBoardValue
 * @param index
 */
function calPromotionRate(
  evenBoardAmount: any,
  evenBoardValue: any,
  index: number,
) {
  return index !== evenBoardValue.length - 1
    ? Math.round(
        (evenBoardAmount / evenBoardValue[index + 1].dailyLimitQuantity) * 100,
      )
    : 0;
}

/**
 * 点击日期获取 涨停数据
 * @param item
 */
async function handleDateClick(item: any) {
  // data.hasSummaryTableData = false;
  data.currentDate = item.createDate;
  // 根据创建时间获取当前 涨停数据
  const index = evenBoard.value.findIndex(
    (evenBoardItem: any) => evenBoardItem.createDate === item.createDate,
  );
  data.currentDateData = evenBoard.value[index];
  // 昨日涨停数据，只要不是列表数据最后一条，昨日涨停数据 = 当前日期涨停数据之后的一条
  data.yesterdayDateData =
    index + 1 >= evenBoard.value.length ? [] : evenBoard.value[index + 1];
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

//暴露state和play方法
defineExpose({
  handleRefreshData,
});
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

.flex__row {
  display: flex;
  flex-direction: row;
  > div {
    width: 50%;
  }
}

.flexCenter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
}

.evenBoard__table * {
  box-sizing: border-box;
}

.evenBoard__table {
  margin: 0 15px 15px 10px;
  overflow: auto;
  display: flex;
  flex-direction: row;
  text-align: center;
  // border-left: 1px solid @tableColumsBorderColor;
  .tableContentBorder();
  .tableColumsBorder();
  &.isMobile {
    margin: 0;
  }

  .date-col {
    .flexCenter();
    justify-content: flex-start;
    // width: 9%;
    // min-width: 9%;
    // max-width: 9%;
    min-width: 130px;
    // white-space: nowrap;

    .dynamic__col {
      width: 100%;
    }

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
    }

    &.isMonday {
      border-right: 2px double #5a9cf8;
      .table__header {
        background-color: #5a9cf8;
        color: #fff !important;
      }
    }
  }

  .table__header {
    background-color: #dcdcdc;
    width: 100%;
    padding: 5px;
    cursor: pointer;
    .tableColumsBorder();

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
    .el-checkbox {
      height: 20px;
    }
  }
  .table-col {
    width: 100%;
    height: 83px;
    overflow: auto;
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
  }

  .downLimitStock__plate {
    padding: 2px;
    color: rgb(45, 182, 136);
  }
}
</style>
