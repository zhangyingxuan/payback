<template>
  <el-row :gutter="10">
    <el-col :span="12">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.shortTermUrl" headerTitle="短线数据" />
        </template>
        <div ref="shortTermChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="hover" class="mgb20" :body-style="{ padding: '10px' }">
        <template #header>
          <CardHeader :url="cardUrls.marketChartUrl" headerTitle="大盘趋势" />
        </template>
        <div ref="marketChart" style="width: 100%; height: 300px"></div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts" setup>
import CardHeader from './components/cardHeader.vue';
import { fetchChartData, ChartResult } from '@/api/payBack';
import { ShortTermModel } from '../../api/model/shortTermModel';
import { MarketModel } from '../../api/model/MarketModel';
import dayjs from 'dayjs';

// X轴 日期，20天
// Y轴 最高连板、涨停个数、跌停个数
import { ref, onMounted, reactive } from 'vue';
//  按需引入 echarts
import * as echarts from 'echarts';
const shortTermChart = ref(); // 使用ref创建虚拟DOM引用，使用时用shortTermChart.value
const marketChart = ref(); // 市场chart
const colors = ['#ED7874', '#ADDE8A', '#EFCA52', '#52B3F5'];
const cardUrls = reactive({
  shortTermUrl:
    'http://www.iwencai.com/unifiedwap/result?w=连续涨停天数>%3D1；不包含新股；不包含ST；涨停原因；封板金额&querytype=stock',
  iLikeUrl:
    'http://www.iwencai.com/unifiedwap/result?w=上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  marketChartUrl: 'http://q.10jqka.com.cn/',
});

onMounted(async () => {
  // 获取图表数据
  const result: ChartResult = await fetchChartData({});
  await initShortTermChart(result.shortTermData);
  await initMarketChart(result.marketData);
});

async function initMarketChart(marketData: MarketModel[]): Promise<any> {
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
  var myChart = echarts.init(marketChart.value);
  const legendData = ['市场评分', '昨日涨停今日收益', '上涨家数', '下跌家数'];
  // 指定图表的配置项和数据
  var option = {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      right: '10%',
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: legendData,
    },
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        data: xAxisData,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: legendData[0],
        position: 'left',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[0],
          },
        },
      },
      {
        show: false,
      },
      {
        type: 'value',
        name: legendData[2],
        position: 'right',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[2],
          },
        },
      },
    ],
    series: [
      {
        name: legendData[0],
        type: 'line',
        yAxisIndex: 1,
        data: yAxisData[0],
      },
      {
        name: legendData[1],
        type: 'line',
        yAxisIndex: 1,
        data: yAxisData[1],
      },
      {
        name: legendData[2],
        type: 'bar',
        yAxisIndex: 2,
        data: yAxisData[2],
      },
      {
        name: legendData[3],
        type: 'bar',
        yAxisIndex: 2,
        data: yAxisData[3],
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}
async function initShortTermChart(
  shortTermData: ShortTermModel[],
): Promise<any> {
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
  var myChart = echarts.init(shortTermChart.value);
  // 指定图表的配置项和数据
  var option = {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      right: '10%',
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: ['涨停', '跌停', '市场高度'],
    },
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        data: xAxisData,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '涨停',
        position: 'left',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[0],
          },
        },
      },
      {
        show: false,
        // type: 'value',
        // name: '跌停',
        // position: 'left',
        // alignTicks: true,
        // offset: 80,
        // axisLine: {
        //   show: true,
        //   lineStyle: {
        //     color: colors[1],
        //   },
        // },
        // axisLabel: {
        //   formatter: '{value} ml',
        // },
      },
      {
        type: 'value',
        name: '市场高度',
        position: 'right',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[2],
          },
        },
      },
    ],
    series: [
      {
        name: '涨停',
        type: 'line',
        yAxisIndex: 1,
        data: yAxisData[0],
      },
      {
        name: '跌停',
        type: 'line',
        yAxisIndex: 1,
        data: yAxisData[1],
      },
      {
        name: '市场高度',
        type: 'bar',
        yAxisIndex: 2,
        data: yAxisData[2],
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}
</script>

<style scoped>
.headerRight {
  text-align: right;
}
</style>
