<template>
  <div
    class="el-alert el-alert--error is-light noice__container"
    v-if="data.latestConceptPlates && data.latestConceptPlates.length > 0"
  >
    <span
      v-for="(item, index) in data.latestConceptPlates"
      :key="index"
      class="latestConceptPlates__item"
    >
      <Plate :name="item.name" :code="item.code" />
      <span>{{ item.createTime }}</span>
    </span>
    <el-tooltip effect="dark" content="15个自然日内的最新概念" placement="top">
      <el-icon class="thsTooltip__icon"><InfoFilled /></el-icon>
    </el-tooltip>
  </div>
  <div class="chartList__container">
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.marketChartUrl" headerTitle="大盘趋势">
          {{ data.latestMarketUpdateTime }}
        </CardHeader>
      </template>
      <div ref="marketChart" :style="data.style"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.indexChartUrl" headerTitle="指数趋势">
          {{ data.latestMarketUpdateTime }}
        </CardHeader>
      </template>
      <div ref="indexChart" :style="data.style"></div>
    </el-card>
    <!-- 热点题材 统计 -->
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.shortTermUrl" headerTitle="短线数据">
          {{ data.latestShortTermUpdateTime }}
        </CardHeader>
      </template>
      <div ref="shortTermChart" :style="data.style"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          :url="cardUrls.longhuListChartUrl"
          headerTitle="龙虎榜（净买大，成交低则反转）"
        />
      </template>
      <div ref="longhuListChart" :style="data.style"></div>
    </el-card>
    <!-- 赚钱效应：封板率，晋级率 -->
    <!-- 亏钱效应：炸板率，跌停数，大面数 -->
    <!-- <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.fundsChartUrl" headerTitle="资金流向">
          {{ data.latestFundsUpdateTime }}
        </CardHeader>
      </template>
      <div ref="fundsChart" :style="data.style"></div>
    </el-card> -->
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          :url="cardUrls.hangyeFundsChartUrl"
          headerTitle="行业资金流向"
        >
          {{ data.latestFundsUpdateTime }}
        </CardHeader>
      </template>
      <div ref="fundsByHangyeChart" :style="data.styleBig"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader
          :url="cardUrls.gainianFundsChartUrl"
          headerTitle="概念资金流向"
        >
          {{ data.latestFundsUpdateTime }}
        </CardHeader>
      </template>
      <div ref="fundsByGainianChart" :style="data.styleBig"></div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import CardHeader from './components/cardHeader.vue';
import {
  fetchChartData,
  ChartResult,
  findConceptPlateWithinNDays,
} from '@/api/payBack';
import { fetchLonghuHistoryData } from '@/api/tonghuashun';
import { ShortTermModel } from '@/api/model/ShortTermModel';
import { MarketModel } from '@/api/model/MarketModel';
import { FundsModel } from '@/api/model/FundsModel';
import {
  getShortTermChartOption,
  getMarketChartOption,
  getIndexChartOption,
  getFundsChartOption,
  getSubFundsChartOption,
  getLonghuListOption,
} from './utils/chartOptionUtil';
import dayjs from 'dayjs';
import {
  transformFundsData,
  transformLonghuListData,
} from './utils/transformUtil';
import { cardUrls } from './utils/config';
import { FundsKey } from './utils/index.d';
import { useSidebarStore } from '@/store/sidebar';
import { ref, onMounted, reactive, watch, getCurrentInstance } from 'vue';
import { isMobile } from '@/core/util';
// 获取当前组件实例
const { proxy }: any = getCurrentInstance();
const echarts = proxy.$echarts;

const sideBar = useSidebarStore();
const { countDays } = storeToRefs(sideBar);
const data = reactive<{
  latestConceptPlates: any;
  latestMarketUpdateTime: string;
  latestShortTermUpdateTime: string;
  latestFundsUpdateTime: string;
  style: string;
  styleBig: string;
}>({
  ...getChartStyle(),
  latestMarketUpdateTime: '',
  latestShortTermUpdateTime: '',
  latestFundsUpdateTime: '',
  latestConceptPlates: [],
});

const chartList: any = {
  shortTermChart: null,
  marketChart: null,
  indexChart: null,
  fundsChart: null,
  fundsByHangyeChart: null,
  fundsByGainianChart: null,
  longhuListChart: null,
};
const shortTermChart = ref(); // 使用ref创建虚拟DOM引用，使用时用shortTermChart.value
const marketChart = ref(); // 市场chart
const indexChart = ref(); // 指数chart
const fundsChart = ref(); // 资金流向Chart
const fundsByHangyeChart = ref(); // 资金流向Chart
const fundsByGainianChart = ref(); // 资金流向Chart
const longhuListChart = ref(); // 龙虎榜Chart

// 监听变化，重新请求数据 暂时去除图表监听 2024-05-27 22:54:18
watch(countDays, val => {
  initPage(val);
});

// 获取15天内最新概念
findConceptPlateWithinNDays({ limit: 15 }).then((result: any) => {
  // console.log(result);
  data.latestConceptPlates = result.map((item: any) => {
    return {
      ...item,
      createTime: dayjs(item.createTime).format('YYYY-MM-DD'),
    };
  });
});

onMounted(async () => {
  await initPage(countDays.value);
  window.addEventListener(
    'resize',
    debounce(() => {
      Object.keys(chartList).forEach(key => {
        chartList[key] && chartList[key].resize();
      });
    }, 500),
  );
});

async function initPage(pageSize = 15) {
  // 初始化龙虎榜数据
  initlonghuListChart(pageSize);

  try {
    // 获取图表数据
    const result: ChartResult = await fetchChartData({
      limit: isMobile ? 10 : pageSize,
    });

    initShortTermChart(result.shortTermData);
    initMarketChart(result.marketData);
    initIndexChart(result.marketData);
    // 展示屏蔽北向，南向; 北向数据已无法实施展示，故参考意义不大 2024-11-29
    // initFundsChart(result.fundsData);
    initHangyeFundsChart(result.fundsData);
    initGainianFundsChart(result.fundsData);

    const styles = getChartStyle();
    data.style = styles.style;
    data.styleBig = styles.styleBig;
    data.latestMarketUpdateTime = dayjs(
      result.marketData[result.marketData.length - 1].createTime,
    ).format('MM/DD HH:mm');
    data.latestShortTermUpdateTime = dayjs(
      result.shortTermData[result.shortTermData.length - 1].createTime,
    ).format('MM/DD HH:mm');
    data.latestFundsUpdateTime = dayjs(
      result.fundsData[result.fundsData.length - 1].createTime,
    ).format('MM/DD HH:mm');

    setTimeout(() => {
      Object.keys(chartList).forEach(key => {
        chartList[key] && chartList[key].resize();
      });
    }, 0);
  } catch (e) {
    console.error(e);
  }
}

function getChartStyle() {
  return {
    style: 'width: 100%; height: 260px',
    styleBig: 'width: 100%; height: 320px',
  };
}

/**
 * 初始化 行业资金图标
 * @param fundsData
 */
async function initlonghuListChart(pageSize: number) {
  // 获取龙虎榜数据
  const response: any = await fetchLonghuHistoryData();

  const { xAxisData, yAxisData, legendData } = transformLonghuListData(
    response.items,
    pageSize,
  );

  // 基于准备好的dom，初始化echarts实例
  chartList.longhuListChart = echarts.init(longhuListChart.value);
  // 指定图表的配置项和数据
  var longhuListOption = getLonghuListOption(xAxisData, yAxisData, legendData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.longhuListChart.setOption(longhuListOption);
}

/**
 * 初始化 行业资金图标
 * @param fundsData
 */
function initHangyeFundsChart(fundsData: FundsModel[]) {
  const { xAxisData, series, legendData } = transformFundsData(
    fundsData,
    FundsKey.hangyeFundsTop,
  );

  // 基于准备好的dom，初始化echarts实例
  chartList.fundsByHangyeChart = echarts.init(fundsByHangyeChart.value);
  // 指定图表的配置项和数据
  var hangyeOption = getSubFundsChartOption(xAxisData, series, legendData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.fundsByHangyeChart.setOption(hangyeOption);
}

/**
 * 初始化 概念资金图标
 * @param fundsData
 */
function initGainianFundsChart(fundsData: FundsModel[]) {
  const { xAxisData, series, legendData } = transformFundsData(
    fundsData,
    FundsKey.gainianFundsTop,
  );

  chartList.fundsByGainianChart = echarts.init(fundsByGainianChart.value);
  // 指定图表的配置项和数据
  var gainianOption = getSubFundsChartOption(xAxisData, series, legendData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.fundsByGainianChart.setOption(gainianOption);
}

async function initFundsChart(fundsData: FundsModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], []];
  fundsData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.northFundsBuyAmt);
    yAxisData[1].push(item.southFundsBuyAmt);
  });
  // 基于准备好的dom，初始化echarts实例
  chartList.fundsChart = echarts.init(fundsChart.value);
  // 指定图表的配置项和数据
  var option = getFundsChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.fundsChart.setOption(option);
}
/**
 * 初始化市场报表
 * @param marketData
 */
function initIndexChart(marketData: MarketModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: any[][] = [[], [], [], [], [], []];
  marketData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.shangzhengPoint);
    yAxisData[1].push(item.shenzhengPoint);
    yAxisData[2].push(item.chuangyePoint);
    yAxisData[3].push(item.beizheng50Point);
    yAxisData[4].push(item.marketTurnover);
    yAxisData[5].push(item.shangzhengRiseAndFall || 0);
  });

  // 基于准备好的dom，初始化echarts实例
  chartList.indexChart = echarts.init(indexChart.value);
  // 指定图表的配置项和数据
  var option = getIndexChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.indexChart.setOption(option);
}
function initMarketChart(marketData: MarketModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], [], []];
  marketData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.marketScore);
    yAxisData[1].push(item.dailyLimitIncome);
    yAxisData[2].push(item.riseAmount);
    yAxisData[3].push(item.fallAmount);
  });

  // 基于准备好的dom，初始化echarts实例
  chartList.marketChart = echarts.init(marketChart.value);
  // 指定图表的配置项和数据
  var option = getMarketChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.marketChart.setOption(option);
}

function initShortTermChart(shortTermData: ShortTermModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], [], []];
  shortTermData.forEach(item => {
    // console.log(item.createTime);
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.dailyLimitQuantity);
    yAxisData[1].push(item.downLimitQuantity);
    yAxisData[2].push(item.evenBoardAmount);
    yAxisData[3].push(item.marketHeight);
  });

  // 基于准备好的dom，初始化echarts实例
  chartList.shortTermChart = echarts.init(shortTermChart.value);
  // 指定图表的配置项和数据
  var option = getShortTermChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.shortTermChart.setOption(option);
}

//暴露state和play方法
defineExpose({
  initPage,
});
</script>

<style scoped lang="less">
.chartList__container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
  width: 100%;

  > .el-card {
    min-width: 0;
    margin: 0;
  }

  :deep(.el-card__header) {
    padding: 5px 10px;
  }
}

@media (max-width: 900px) {
  .chartList__container {
    grid-template-columns: minmax(0, 1fr);
  }
}

.noice__container {
  margin-bottom: 15px;
  font-size: 12px;
  .latestConceptPlates__item {
    margin-right: 20px;
    > span {
      margin-right: 5px;
    }
  }
}
</style>
