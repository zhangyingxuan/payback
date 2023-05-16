const grid = {
  right: 60,
  // top: '30%',
  x2: 20,
  y2: 30,
  x: 50,
  y: 80,
};
const gridShortTerm = {
  // top: '30%',
  x2: 30,
  y2: 30,
  x: 30,
  y: 60,
};

export const getFundsChartOption = function (xAxisData: any, yAxisData: any) {
  const colors = ['#ED7874', '#ADDE8A', '#EFCA52'];
  const legendData = ['北向资金', '南向资金', '成交量总额'];
  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid,
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
        axisLabel: {
          formatter: '{value} 万亿',
        },
      },
    ],
    series: [
      {
        name: legendData[0],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[0],
        label: {
          show: true,
          color: colors[0],
          position: 'top'
        },
      },
      {
        name: legendData[1],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[1],
      },
      {
        name: legendData[2],
        type: 'bar',
        yAxisIndex: 1,
        data: yAxisData[2],
        label: {
          show: true,
          color: '#fff',
          position: 'inside'
        },
      },
    ],
  };
}

export const getIndexChartOption = function (xAxisData: any, yAxisData: any) {
  const colors = ['#ED7874', '#ADDE8A', '#EFCA52', '#52B3F5'];
  const legendData = ['上证指数', '深圳指数', '创业指数', '北证50'];
  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid,
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
        // show: false,
        type: 'value',
        name: legendData[0],
        position: 'left',
        alignTicks: true,
        min: function (value: any) {
          return +(value.min - 100).toFixed(0);
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[0],
          },
        },
      }, {
        // 深圳指数
        // show: false,
        type: 'value',
        name: legendData[1],
        position: 'right',
        alignTicks: true,
        min: function (value: any) {
          return +(value.min - 1000).toFixed(0);
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[1],
          },
        },
      }, {
        show: false,
        type: 'value',
        name: legendData[2],
        position: 'left',
        alignTicks: true,
        min: function (value: any) {
          return +(value.min - 50).toFixed(0);
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[2],
          },
        },
      }, {
        // 北证50
        show: false,
        type: 'value',
        name: legendData[3],
        position: 'left',
        alignTicks: true,
        min: function (value: any) {
          return +(value.min - 10).toFixed(0);
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: colors[1],
          },
        },
      },
    ],
    series: [
      {
        name: legendData[0],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[0],
        label: {
          show: true,
          color: colors[0],
          position: 'top'
        },
      },
      {
        name: legendData[1],
        type: 'line',
        yAxisIndex: 1,
        data: yAxisData[1],
      },
      {
        name: legendData[2],
        type: 'line',
        yAxisIndex: 2,
        data: yAxisData[2],
      },
      {
        name: legendData[3],
        type: 'line',
        yAxisIndex: 3,
        data: yAxisData[3],
      },
    ],
  };
}

export const getMarketChartOption = function (xAxisData: any, yAxisData: any) {
  const colors = ['#EFCA52', '#52B3F5', '#ED7874', '#ADDE8A'];
  const legendData = ['市场评分', '昨日涨停今日收益', '上涨家数', '下跌家数'];
  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid,
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
        axisLabel: {
          formatter: '{value} 家',
        },
      },
    ],
    series: [
      {
        name: legendData[0],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[0],
        label: {
          show: true,
          color: colors[0],
          position: 'top'
        },
      },
      {
        name: legendData[1],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[1],
      },
      {
        name: legendData[2],
        type: 'bar',
        yAxisIndex: 1,
        data: yAxisData[2],
        label: {
          show: true,
          color: '#fff',
          position: 'inside'
        },
        stack: 'marketAmount',
      },
      {
        name: legendData[3],
        type: 'bar',
        yAxisIndex: 1,
        data: yAxisData[3],
        label: {
          show: true,
          color: '#fff',
          position: 'inside'
        },
        stack: 'marketAmount',
      },
    ],
  };
}

export const getShortTermChartOption = function (xAxisData: any, yAxisData: any) {
  const colors = ['#ED7874', '#ADDE8A', '#EFCA52', '#52B3F5'];
  const legendData = ['涨停', '跌停', '市场高度'];
  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: gridShortTerm,
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
        yAxisIndex: 0,
        data: yAxisData[0],
        label: {
          show: true,
          position: 'top',
          color: colors[0],
        },
      },
      {
        name: legendData[1],
        type: 'line',
        yAxisIndex: 0,
        data: yAxisData[1],
      },
      {
        name: legendData[2],
        type: 'bar',
        yAxisIndex: 1,
        data: yAxisData[2],
      },
    ],
  };
}
/**
 * 行业/概念 板块主力资金Top
 * @param xAxisData 
 * @param yAxisData 
 * @returns 
 */
export const getSubFundsChartOption = function (xAxisData: any, series: any, legendData: any) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    color: [
      '#9C130B',
      '#BD2512',
      '#BD3B1B',
      // '#C6B43D',
      // '#C0C634',

      '#1B3A10',
      '#224C15',
      '#306A1E',
      // '#489F2D',
      // '#5AC738',
    ],
    // legend: {
    //   data: legendData,
    // },
    grid: {
      top: '3%',
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
    yAxis: [
      {
        type: 'value'
      }
    ],
    xAxis: [
      {
        type: 'category',
        axisTick: {
          show: false
        },
        data: xAxisData,
      }
    ],
    series,
  };
}