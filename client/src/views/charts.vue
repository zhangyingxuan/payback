<script lang="ts" setup>
import payBack from '@/api/payBack';
// X轴 日期，20天
// Y轴 最高连板、涨停个数、跌停个数
import { ref, onMounted } from 'vue';
//  按需引入 echarts
import * as echarts from 'echarts';
const main = ref(); // 使用ref创建虚拟DOM引用，使用时用main.value
const colors = ['#5470C6', '#91CC75', '#EE6666', '#ccc'];

onMounted(async () => {
  await init();
});
async function init(): Promise<any> {
  const data = await payBack.fetchShortTermData({});
  console.log(data);

  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(main.value);
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
      data: ['Evaporation', 'Precipitation', 'Temperature', 'Temperature1'],
    },
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        // prettier-ignore
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Evaporation',
        position: 'right',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[0],
          },
        },
        axisLabel: {
          formatter: '{value} ml',
        },
      },
      {
        type: 'value',
        name: 'Precipitation',
        position: 'right',
        alignTicks: true,
        offset: 80,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[1],
          },
        },
        axisLabel: {
          formatter: '{value} ml',
        },
      },
      {
        type: 'value',
        name: '温度',
        position: 'left',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[2],
          },
        },
        axisLabel: {
          formatter: '{value} °C',
        },
      },
    ],
    series: [
      {
        name: 'Evaporation',
        type: 'bar',
        yAxisIndex: 1,
        data: [
          2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3,
        ],
      },
      {
        name: 'Precipitation',
        type: 'bar',
        yAxisIndex: 1,
        data: [
          2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3,
        ],
      },
      {
        name: 'Temperature',
        type: 'line',
        yAxisIndex: 2,
        data: [
          2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2,
        ],
      },
      {
        name: 'Temperature1',
        type: 'line',
        // color: '#ccc',
        yAxisIndex: 2,
        data: [2.9, 3.2, 2.3, 5.5, 6.6, 1.2, 2.3, 20.4, 23.0, 16.5, 12.0, 6.2],
      },
    ],
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}
</script>

<template>
  <div ref="main" style="width: 100%; height: 600px"></div>
</template>

<style scoped></style>
