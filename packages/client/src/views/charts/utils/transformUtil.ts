
import { FundsModel } from '../../../api/model/FundsModel';
import { ShortTermModel } from '../../../api/model/shortTermModel';
import dayjs from 'dayjs';
import _ from 'lodash-es';
import { FundsKey } from '../utils/index.d';

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
      // 找出题材共性，按涨停题材 排序
      const ticaiData: any = {};
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
      // 取出前3 题材并展示
      // console.log(item.createTime, ticaiData, sortObj(ticaiData));

      const itemData: any = {
        createTime: item.createTime,
        createDate: dayjs(item.createTime).format('MM/DD'),
        maxHeight: maxHeight,
        evenBoardData,
        cycle: item.cycle,
        dailyLimitQuantity: item.dailyLimitQuantity,
        downLimitQuantity: item.downLimitQuantity,
        sealingRate: item.sealingRate,
        dailyLimitReturnSealQuantity: item.dailyLimitReturnSealQuantity,
        evenBoardAmount: item.evenBoardAmount,
        ticaiData: sortObj(ticaiData).splice(0, 3)
      };
      item.downLimitData && (itemData.downLimitData = JSON.parse(item.downLimitData));
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
    let o = { key: '', value: 0 };
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

function getCurrentCycle(item: any) {
  // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
  // 2、发酵；3、分歧转一致；4、加速；5、分歧转一致；6、加速；7、见顶；8、调整；9、反包；
  // 高度>=5；连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
  // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
  // 4、衰退：总龙头见顶，高位连板股出现亏钱效应
  // 5、冰点：
  // 周期定义
  const cycles = ['启动', '发酵', '高潮', '退潮', '冰点'];
  // 最大高度 item.evenBoardData
  const maxHeight: any = item.evenBoardData.maxHeight;
  // 跌停数量
  if (maxHeight <= 4) {
    if (item.downLimitQuantity > 10) {
      return cycles[4];
    }
    // 启动前 必须4板
    if (maxHeight === 4) {
      return cycles[0];
    }
    return cycles[3];
  }
  if (maxHeight >= 5) {
    if (item.evenBoardAmount >= 10 || item.dailyLimitQuantity >= 45) {
      return cycles[2];
    }
    return cycles[1];
  }
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