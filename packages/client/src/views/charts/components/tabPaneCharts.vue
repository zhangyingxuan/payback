<template>
  <div class="chartList__container">
    <!-- 日期、涨停、跌停、连板、赚钱效应、亏钱效应、评分、北向南向（+-5%的个股数量）最近节日倒计时 -->
    <!-- <el-card shadow="hover" class="mgb15" style="width: 100%">
      <el-tag size="large" type="success">机会</el-tag>
    </el-card> -->
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.marketChartUrl" headerTitle="大盘趋势" />
      </template>
      <div ref="marketChart" :style="data.style"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.indexChartUrl" headerTitle="指数趋势" />
      </template>
      <div ref="indexChart" :style="data.style"></div>
    </el-card>
    <!-- 热点题材 统计 -->
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.shortTermUrl" headerTitle="短线数据" />
      </template>
      <div ref="shortTermChart" :style="data.style"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <template #header>
        <CardHeader :url="cardUrls.fundsChartUrl" headerTitle="资金流向" />
      </template>
      <div ref="fundsChart" :style="data.style"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <!-- <template #header>
        <CardHeader
          :url="cardUrls.hangyeFundsChartUrl"
          headerTitle="行业板块资金流向TOP"
        />
      </template> -->
      <div ref="fundsByHangyeChart" :style="data.styleBig"></div>
    </el-card>
    <el-card shadow="hover" class="mgb15" :body-style="{ padding: '0px' }">
      <!-- <template #header>
        <CardHeader
          :url="cardUrls.gainianFundsChartUrl"
          headerTitle="概念板块资金流向TOP"
        />
      </template> -->
      <div ref="fundsByGainianChart" :style="data.styleBig"></div>
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
  </div>
</template>
<script lang="ts" setup>
import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import CardHeader from './cardHeader.vue';
import { fetchChartData, ChartResult } from '@/api/payBack';
import { fetchLonghuHistoryData } from '@/api/tonghuashun';
import { ShortTermModel } from '@/api/model/shortTermModel';
import { MarketModel } from '@/api/model/MarketModel';
import { FundsModel } from '@/api/model/FundsModel';
import {
  getShortTermChartOption,
  getMarketChartOption,
  getIndexChartOption,
  getFundsChartOption,
  getSubFundsChartOption,
  getLonghuListOption,
} from '../utils/util';
import dayjs from 'dayjs';
import {
  transformFundsData,
  transformLonghuListData,
} from '../utils/transformUtil';
import { columnsConfig, cardUrls } from '../utils/config';
import { FundsKey } from '../utils/index.d';
import { useSidebarStore } from '@/store/sidebar';

import { ref, onMounted, reactive, watch } from 'vue';
//  按需引入 echarts
import * as echarts from 'echarts';
import { isMobile } from '@/core/util';

const siderBar = useSidebarStore();
const { countDays } = storeToRefs(siderBar);
const data = reactive({
  ...getChartStyle(),
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

// 监听变化，重新请求数据
watch(countDays, async val => {
  await initPage(val);
});

onMounted(async () => {
  await initPage(countDays.value);
  window.addEventListener(
    'resize',
    debounce(() => {
      Object.keys(chartList).forEach(key => {
        chartList[key].resize();
      });
    }, 500),
  );
});

async function initPage(pageSize: number) {
  // 初始化龙虎榜数据
  initlonghuListChart(pageSize);

  try {
    // 获取图表数据
    const result: ChartResult = await fetchChartData({
      limit: isMobile ? 10 : pageSize,
    });

    const styles = getChartStyle();
    data.style = styles.style;
    data.styleBig = styles.styleBig;

    initShortTermChart(result.shortTermData);
    initMarketChart(result.marketData);
    initIndexChart(result.marketData);
    initFundsChart(result.fundsData);
    initHangyeFundsChart(result.fundsData);
    initHangyeGainianFundsChart(result.fundsData);
  } catch (e) {
    // console.log(e);
  }

  setTimeout(() => {
    Object.keys(chartList).forEach(key => {
      chartList[key] && chartList[key].resize();
    });
  }, 0);
}

function getChartStyle() {
  // 计算宽度；屏幕宽度 - 左侧siderBar - 边框 - cardLeft
  const columnsAmount = columnsConfig[countDays.value];
  const screenWidth = screen.width - 64 - 20 - columnsAmount * 15;
  const cardWidth = isMobile ? screen.width - 30 : screenWidth / columnsAmount;
  return {
    style: `width: ${cardWidth}px; height: 260px`,
    styleBig: `width: ${cardWidth}px; height: 320px`,
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
function initHangyeGainianFundsChart(fundsData: FundsModel[]) {
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

async function initFundsChart(marketData: FundsModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], [], []];
  marketData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.northFundsBuyAmt);
    yAxisData[1].push(item.southFundsBuyAmt);
    yAxisData[2].push(item.marketTurnover);
  });

  // 基于准备好的dom，初始化echarts实例
  chartList.fundsChart = echarts.init(fundsChart.value);
  // 指定图表的配置项和数据
  var option = getFundsChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.fundsChart.setOption(option);
}
function initIndexChart(marketData: MarketModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], [], []];
  marketData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.shangzhengPoint);
    yAxisData[1].push(item.shenzhengPoint);
    yAxisData[2].push(item.chuangyePoint);
    yAxisData[3].push(item.beizheng50Point);
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
</script>

<style scoped lang="less">
.headerRight {
  text-align: right;
}
.chartList__container {
  display: flex;
  flex-wrap: wrap;

  > .el-card {
    margin-left: 15px;
  }

  /deep/.el-card__header {
    padding: 5px 10px;
  }
}
</style>
