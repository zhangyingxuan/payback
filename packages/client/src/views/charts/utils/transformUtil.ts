
import { FundsModel } from '../../../api/model/FundsModel';
import { ShortTermModel } from '../../../api/model/ShortTermModel';
import dayjs from 'dayjs';
import _ from 'lodash-es';
import { FundsKey } from '../utils/index.d';
import { getCurrentCycle } from 'pay-back-core';

/**
 * 转换 行业、概念资金 图标数据
 * @param fundsData
 * @param key
 */
export const transformFundsData = (fundsData: FundsModel[], key: FundsKey) => {
  const xAxisData: any[] = [];
  // 流入Top5 + 流出Top5 共10条数据
  const series: Object[] = [];
  const legendData: any = [];
  const inData: any = {
    inTop1: [],
    inTop2: [],
    inTop3: [],
    inTop4: [],
    inTop5: [],
  };
  const outData: any = {
    outTop1: [],
    outTop2: [],
    outTop3: [],
    outTop4: [],
    outTop5: [],
  };
  const topMaxAmount = 3;
  fundsData.forEach(item => {
    const fundsTop: any = JSON.parse(item[key] || '{}');
    if (_.isEmpty(fundsTop)) {
      return
    }
    // 准备某一天的数据
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    for (let i = 0; i < topMaxAmount; i++) {
      inData['inTop' + (i + 1)].push({
        name: fundsTop.in[i]?.name || '无',
        value: fundsTop.in[i]?.funds || 0,
      });

      outData['outTop' + (i + 1)].push({
        name: fundsTop.out[i]?.name || '无',
        value: fundsTop.out[i]?.funds || 0,
      });
    }
  });

  for (let i = 0; i < topMaxAmount; i++) {
    const name = '+TOP' + (i + 1);
    legendData.push(name);
    series.push({
      name,
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        fontSize: 8,
        position: 'inside',
        formatter: function (params: any) {
          return params?.data?.name;
        },
      },
      emphasis: {
        focus: 'series',
      },
      data: inData['inTop' + (i + 1)],
    });
  }
  for (let i = 0; i < topMaxAmount; i++) {
    const name = '-TOP' + (i + 1);
    legendData.push(name);
    series.push({
      name,
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        fontSize: 8,
        position: 'inside',
        formatter: function (params: any) {
          return params?.data?.name;
        },
      },
      emphasis: {
        focus: 'series',
      },
      data: outData['outTop' + (i + 1)],
    });
  }

  return {
    xAxisData,
    series,
    legendData,
  };
}

/**
* 转换连板梯队 数据
* @param shortTermData
*/
export function transformEvenBoardData(shortTermData: ShortTermModel[]): any[] {
  const evenBoardList: any[] = [];

  shortTermData.map(item => {
    if (item.evenBoardData) {
      const evenBoardData = JSON.parse(item.evenBoardData);
      // 找出题材共性，按涨停题材 排序
      const ticaiData: any = {};
      const gainianData: any = {};
      const maxHeight = evenBoardData.maxHeight;

      for (let i = 1; i <= maxHeight; i++) {
        evenBoardData[i] && evenBoardData[i].forEach((item: any) => {
          const resons = item.reason ? item.reason.split('+') : null;
          resons && resons.forEach((reson: any) => {
            if (!ticaiData[reson]) {
              ticaiData[reson] = 1;
            } else {
              ticaiData[reson]++;
            }
          });
          // 转换概念板块 的数据结构
          if (item.gainian) {
            item.gainian = item.gainian.split(',').map(((gainian: string) => {
              const gainianInfo = gainian.split(':');
              if (!gainianData[gainianInfo[0]]) {
                gainianData[gainianInfo[0]] = 1;
              } else {
                gainianData[gainianInfo[0]]++;
              }

              return {
                name: gainianInfo[0],
                code: gainianInfo[1]
              }
            }));
          }
        });
      }
      // 取出前3 题材并展示
      // console.log(item.createTime, ticaiData, sortObj(ticaiData));

      const itemData: any = {
        createTime: item.createTime,
        createDate: dayjs(item.createTime).format('MM/DD'),
        maxHeight,
        marketHeight: maxHeight,
        evenBoardData,
        cycle: item.cycle,
        dailyLimitQuantity: item.dailyLimitQuantity,
        downLimitQuantity: item.downLimitQuantity,
        sealingRate: item.sealingRate,
        dailyLimitReturnSealQuantity: item.dailyLimitReturnSealQuantity,
        evenBoardAmount: item.evenBoardAmount,
        yizi: evenBoardData.yizi,
        biddingDataUpdateTime: dayjs(item.biddingDataUpdateTime).format('MM/DD HH:mm'),
        ticaiData: sortObj(ticaiData).splice(0, 3),
        gainianData: sortObj(gainianData).splice(0, 3)
      };

      item.downLimitData && (itemData.downLimitData = JSON.parse(item.downLimitData));
      item.hugeFallData && (itemData.hugeFallData = JSON.parse(item.hugeFallData));
      item.newStock && (itemData.newStock = JSON.parse(item.newStock));
      item.chooseStock && (itemData.chooseStock = JSON.parse(item.chooseStock));
      !itemData.cycle && (itemData.cycle = getCurrentCycle(itemData));

      evenBoardList.push(itemData);
    }
  });

  return evenBoardList;
}

/**
 * 按板块排序 排序
 * @param obj
 */
function sortObj(obj: any) {
  // 将对象转换为数组 便于排序
  const arr: any[] = [];
  Object.keys(obj).forEach(key => {
    const o = { key: '', value: 0 };
    o.key = key;
    o.value = obj[key];
    arr.push(o);
  });

  // 按 行业板块 涨停数量降序
  arr.sort((a: any, b: any) => {
    return b.value - a.value;
  });
  return arr;
}

/**
 * 龙虎榜
 * @param shortTermData 
 */
export function transformLonghuListData(longhuListData: any, pageSize: number): any {
  const legendData = ['总榜净买', '机构净买', '游资净买', '游资成交'];
  // const legendData = ['总榜净买', '机构净买', '游资净买','总榜成交', '机构成交', '游资成交'];
  const data = longhuListData.splice(longhuListData.length - pageSize, pageSize);
  const xAxisData: string[] = [];
  const yAxisData: any[] = [[], [], [], []];
  // const yAxisData: any[] = [[], [], [], [], [], []];
  data.forEach((item: any) => {
    xAxisData.push(dayjs(item.date).format('MM/DD'));
    // 总榜净买
    yAxisData[0].push(toFloat2(item.net_value));
    // 机构净买
    yAxisData[1].push(toFloat2(item.org_net_value));
    // 游资净买
    yAxisData[2].push(toFloat2(item.hot_money_net_value));
    // // 总榜成交
    // yAxisData[3].push(toFloat2(item.amount));
    // // 机构成交
    // yAxisData[4].push(toFloat2(item.org_amount));
    // // 游资成交
    yAxisData[3].push(toFloat2(item.hot_money_amount));
  });

  return { xAxisData, yAxisData, legendData };
}

function toFloat2(value: number) {
  return +(value / 100000000).toFixed(2)
}