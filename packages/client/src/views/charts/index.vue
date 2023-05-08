<template>
  <el-row :gutter="10">
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.shortTermUrl" headerTitle="短线数据" />
        </template>
        <div ref="shortTermChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.marketChartUrl" headerTitle="大盘趋势" />
        </template>
        <div ref="marketChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="10">
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.indexChartUrl" headerTitle="指数趋势" />
        </template>
        <div ref="indexChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
    <el-col :span="12" :xs="24">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.fundsChartUrl" headerTitle="资金流向" />
        </template>
        <div ref="fundsChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import { debounce } from 'lodash-es';
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
} from './util';
import dayjs from 'dayjs';

// X轴 日期，20天
// Y轴 最高连板、涨停个数、跌停个数
import { ref, onMounted, reactive } from 'vue';
//  按需引入 echarts
import * as echarts from 'echarts';
const chartList: any = {
  shortTermChart: null,
  marketChart: null,
  indexChart: null,
  fundsChart: null,
};
const shortTermChart = ref(); // 使用ref创建虚拟DOM引用，使用时用shortTermChart.value
const marketChart = ref(); // 市场chart
const indexChart = ref(); // 指数chart
const fundsChart = ref(); // 资金流向Chart
const cardUrls = reactive({
  shortTermUrl:
    'http://www.iwencai.com/unifiedwap/result?w=连续涨停天数>%3D1；不包含新股；不包含ST；涨停原因；封板金额&querytype=stock',
  iLikeUrl:
    'http://www.iwencai.com/unifiedwap/result?w=上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  marketChartUrl: 'http://q.10jqka.com.cn/',
  fundsChartUrl: 'https://data.eastmoney.com/hsgt/index.html',
  indexChartUrl: 'http://q.10jqka.com.cn',
});

onMounted(async () => {
  // 获取图表数据
  const result: ChartResult = await fetchChartData({});
  initShortTermChart(result.shortTermData);
  initMarketChart(result.marketData);
  initIndexChart(result.marketData);
  initFundsChart(result.fundsData);

  window.addEventListener(
    'resize',
    debounce(() => {
      console.log('resize======', chartList);
      Object.keys(chartList).forEach(key => {
        chartList[key].resize();
      });
    }, 500),
  );
});

async function initFundsChart(marketData: FundsModel[]) {
  let xAxisData: any[] = [];
  let yAxisData: number[][] = [[], [], [], []];
  marketData.forEach(item => {
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    yAxisData[0].push(item.northFunds);
    yAxisData[1].push(item.southFunds);
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
