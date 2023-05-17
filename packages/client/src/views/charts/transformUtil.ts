
import { FundsModel } from '../../api/model/FundsModel';
import { ShortTermModel } from '../../api/model/shortTermModel';
import { FundsKey } from './index.d';
import dayjs from 'dayjs';
import _ from 'lodash-es';

/**
 * 转换 行业、概念资金 图标数据
 * @param fundsData
 * @param key
 */
export const transformFundsData = (fundsData: FundsModel[], key: FundsKey) => {
  let xAxisData: any[] = [];
  // 流入Top5 + 流出Top5 共10条数据
  let series: Object[] = [];
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
    const hangyeFundsTop: any = JSON.parse(item[key] || '{}');
    if (_.isEmpty(hangyeFundsTop)) {
      return
    }
    // 准备某一天的数据
    xAxisData.push(dayjs(item.createTime).format('MM/DD'));
    for (let i = 0; i < topMaxAmount; i++) {
      inData['inTop' + (i + 1)].push({
        name: hangyeFundsTop.in[i].name,
        value: hangyeFundsTop.in[i].funds,
      });

      outData['outTop' + (i + 1)].push({
        name: hangyeFundsTop.out[i].name,
        value: hangyeFundsTop.out[i].funds,
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
      const ticaiData: any = {};

      // 找出题材共性，涨停最多的 6个题材
      const maxHeight = evenBoardData.maxHeight;
      for (let i = 1; i <= maxHeight; i++) {
        evenBoardData[i] && evenBoardData[i].forEach((item: any) => {
          const resons = item.reason ? item.reason.split('+') : ['其它'];
          resons.forEach((reson: any) => {
            !ticaiData[reson] && (ticaiData[reson] = 1);
            ticaiData[reson]++;
          });
        });
      }
      // console.log(ticaiData);

      evenBoardList.push({
        createTime: dayjs(item.createTime).format('MM/DD'),
        maxHeight: evenBoardData.maxHeight,
        evenBoardData,
      });
    }
  });

  return evenBoardList;
}