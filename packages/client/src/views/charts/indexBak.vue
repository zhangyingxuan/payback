<template>
  <!-- 连板梯队数据 -->
  <EvenBoardTable :evenBoardList="evenBoard.value" />
  <!-- 热点题材 统计 -->
  <el-row :gutter="10">
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.shortTermUrl" headerTitle="短线数据" />
        </template>
        <div ref="shortTermChart" :style="data.style"></div>
      </el-card>
    </el-col>
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.marketChartUrl" headerTitle="大盘趋势" />
        </template>
        <div ref="marketChart" :style="data.style">></div>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="10">
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.indexChartUrl" headerTitle="指数趋势" />
        </template>
        <div ref="indexChart" :style="data.style">></div>
      </el-card>
    </el-col>
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.fundsChartUrl" headerTitle="资金流向" />
        </template>
        <div ref="fundsChart" :style="data.style">></div>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="10">
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader
            :url="cardUrls.hangyeFundsChartUrl"
            headerTitle="行业板块资金流向TOP"
          />
        </template>
        <div ref="fundsByHangyeChart" :style="data.style"></div>
      </el-card>
    </el-col>
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader
            :url="cardUrls.gainianFundsChartUrl"
            headerTitle="概念板块资金流向TOP"
          />
        </template>
        <div ref="fundsByGainianChart" :style="data.style"></div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import EvenBoardTable from './components/evenBoardTable.vue';
import CardHeader from './components/cardHeader.vue';
import { fetchChartData, ChartResult } from '@/api/payBack';
import { ShortTermModel } from '../../api/model/shortTermModel';
import { MarketModel } from '../../api/model/MarketModel';
import { FundsModel } from '../../api/model/FundsModel';
import {
  getShortTermChartOption,
  getMarketChartOption,
  getIndexChartOption,
  getFundsChartOption,
  getSubFundsChartOption,
} from './utils/util';
import dayjs from 'dayjs';
import { transformFundsData } from './utils/transformUtil';
import { FundsKey } from './utils';
import { useSidebarStore } from '@/store/sidebar';

// X轴 日期，20天
// Y轴 最高连板、涨停个数、跌停个数
import { ref, onMounted, reactive, watch } from 'vue';
//  按需引入 echarts
import * as echarts from 'echarts';
const siderBar = useSidebarStore();
const { countDays } = storeToRefs(siderBar);

const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';

const chartList: any = {
  shortTermChart: null,
  marketChart: null,
  indexChart: null,
  fundsChart: null,
  fundsByHangyeChart: null,
  fundsByGainianChart: null,
};

const data = reactive({
  style: 'width: 100%; height: 300px',
});

const shortTermChart = ref(); // 使用ref创建虚拟DOM引用，使用时用shortTermChart.value
const marketChart = ref(); // 市场chart
const indexChart = ref(); // 指数chart
const fundsChart = ref(); // 资金流向Chart
const fundsByHangyeChart = ref(); // 资金流向Chart
const fundsByGainianChart = ref(); // 资金流向Chart
const cardUrls = reactive({
  shortTermUrl:
    iwencaiUrl +
    '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额&querytype=stock',
  iLikeUrl:
    iwencaiUrl +
    '上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  marketChartUrl: 'http://q.10jqka.com.cn/',
  fundsChartUrl: 'https://data.eastmoney.com/hsgt/index.html',
  indexChartUrl: 'http://q.10jqka.com.cn',
  hangyeFundsChartUrl:
    iwencaiUrl + '行业板块主力资金；主力资金流向金额正序&querytype=zhishu',
  gainianFundsChartUrl:
    iwencaiUrl + '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
});
let evenBoard = reactive<any>({ value: [] });

// const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

// 监听变化，重新请求数据
watch(countDays, val => {
  initPage(val);
  data.style = 'width: 100%; height: 200px';
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
function transformEvenBoardData(shortTermData: ShortTermModel[]): any[] {
  const evenBoardList: any[] = [];

  shortTermData.map(item => {
    if (item.evenBoardData) {
      const evenBoardData = JSON.parse(item.evenBoardData);
      const ticaiData: any = {};

      // 找出题材共性，涨停最多的 6个题材
      const maxHeight = evenBoardData.maxHeight;
      for (let i = 1; i <= maxHeight; i++) {
        evenBoardData[i].forEach((item: any) => {
          const resons = item.reason.split('+');
          resons.forEach((reson: any) => {
            !ticaiData[reson] && (ticaiData[reson] = 1);
            ticaiData[reson]++;
          });
        });
      }
      console.log(ticaiData);

      evenBoardList.push({
        createTime: dayjs(item.createTime).format('MM/DD'),
        maxHeight: evenBoardData.maxHeight,
        evenBoardData,
      });
    }
  });

  return evenBoardList;
}

async function initPage(pageSize: number) {
  // 获取图表数据
  const result: ChartResult = await fetchChartData({
    limit: pageSize,
    // limit: isMobile ? 10 : 20,
  });

  initShortTermChart(result.shortTermData);
  initMarketChart(result.marketData);
  initIndexChart(result.marketData);
  initFundsChart(result.fundsData);
  initHangyeFundsChart(result.fundsData);
  initHangyeGainianFundsChart(result.fundsData);
  evenBoard.value = transformEvenBoardData(result.shortTermData);
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
    yAxisData[2].push(item.marketHeight);
    // yAxisData[3].push(item.dailyLimitQuantity);
  });

  // 基于准备好的dom，初始化echarts实例
  chartList.shortTermChart = echarts.init(shortTermChart.value);
  // 指定图表的配置项和数据
  var option = getShortTermChartOption(xAxisData, yAxisData);
  // 使用刚指定的配置项和数据显示图表。
  chartList.shortTermChart.setOption(option);
}
</script>

<style scoped>
.headerRight {
  text-align: right;
}
</style>
