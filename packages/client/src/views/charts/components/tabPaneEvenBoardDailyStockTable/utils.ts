import dayjs from 'dayjs';
import { isMainPlate } from 'pay-back-core';

/**
 * 获取板块 个股 开票预期情况（超预期 / 符合预期 / 不及预期）
 */
function getPlateExpectCondition(stocks: Array<any>) {
  let exceededNum = 0,
    conformToNum = 0,
    incompatibleNum = 0;
  stocks &&
    stocks.forEach((stock: any) => {
      const biddingData = stock.biddingData;
      // // 符合预期
      // conformTo = 1,
      // // 超预期
      // exceed = 2,
      // // 不及预期
      // incompatible = 0,
      if (biddingData && biddingData.expected == 1) {
        conformToNum++;
      } else if (biddingData && biddingData.expected == 2) {
        exceededNum++;
      } else {
        incompatibleNum++;
      }
    });
  return { incompatibleNum, conformToNum, exceededNum };
}

/**
 * 计算板块 不及预期率
 * @param stocks 
 * @returns 
 */
export function calcIncompatibleRate(stocks: Array<any>, showBidding: boolean) {
  if (!showBidding) {
    return {};
  }
  const { incompatibleNum, conformToNum, exceededNum } =
    getPlateExpectCondition(stocks);
  // 没有不及预期，则不是 紫色 就是 红色
  const rate = +(
    incompatibleNum /
    (incompatibleNum + conformToNum + exceededNum)
  ).toFixed(2);
  return {
    incompatibleNum,
    conformToNum,
    exceededNum,
    rate,
  };
}

// 对象转数组
export function transformObj2Arr(stockGroupByPlateTemp: Array<any>, showBidding: boolean) {
  const stockGroupByPlateArr: any[] = [];
  Object.keys(stockGroupByPlateTemp).forEach((key: any) => {
    const o: any = {
      key: '',
      value: [],
      closingFundsTotal: stockGroupByPlateTemp[key].closingFundsTotal,
      // 计算板块 不及预期率
      incompatibleRate: calcIncompatibleRate(
        stockGroupByPlateTemp[key],
        showBidding,
      ),
    };
    o.key = key;
    // 板块内 个股按 连板高度降序 => 首次涨停时间降序
    o.value = sortStocks(stockGroupByPlateTemp[key]);
    o.maxHeight = o.value[0].evenBoardHeight;
    stockGroupByPlateArr.push(o);
  });
  return stockGroupByPlateArr;
}

/**
 * 个股排序 板块内 个股按 连板高度降序 => 首次涨停时间降序
 * @param stocks
 */
function sortStocks(stocks: []) {
  // 首板按涨停时间排序
  stocks.sort((a: any, b: any) => {
    const aStart =
      a.dailyTime.indexOf(',') > -1 ? a.dailyTime.split(',')[0] : a.dailyTime;
    const bStart =
      b.dailyTime.indexOf(',') > -1 ? b.dailyTime.split(',')[0] : b.dailyTime;

    return dayjs('2023-09-05' + aStart).isBefore(dayjs('2023-09-05' + bStart))
      ? -1
      : 1;
  });

  let aHeight, bHeight;
  // 连板高度降序
  stocks.sort((a: any, b: any) => {
    // 反包板高于首板 处理
    aHeight = +getRealEvenBoardHeight(a);
    bHeight = +getRealEvenBoardHeight(b);

    return bHeight - aHeight;
  });
  return stocks;
}

/**
 * 获取个股真正的 高度
 * 竞价时 反包首板，不能按正常首板考量
 * 其他情况，可按首板考虑
 */
export function getRealEvenBoardHeight(item: any, isBiddingMode = false) {
  if (!item) {
    return 0;
  }
  // 反包板
  if (item.evenBoardHeight.indexOf('天') > -1) {
    // 反包 非首板
    if (item.evenBoardHeight.indexOf('，') > -1) {
      return item.evenBoardHeight.split('，')[0];
    }
    // 反包首板，强制将反包首板视为非首板
    return isBiddingMode ? 2 : 1;
  }
  return item.evenBoardHeight;
}

/**
 * 是否符合我的竞价策略 - 超预期；换手率>=5%，竞价量比大于10（连板及反包除外）
 */
export function isConformToMyStrategyChecked(stock: any) {
  // 只看主板 
  // 新增 创业板 add by yxuanzhang 2024 - 10 -08 14: 30: 56
  if (!isMainPlate(stock.code) && !stock.code.startsWith('30')) {
    return false;
  }

  const biddingData = stock.biddingData;
  // 超预期
  let isConform = biddingData.expected === 2;
  // 首板 必须竞价量比大于10，换手率>=5%
  if (stock.evenBoardHeight === '1' && isConform) {
    isConform =
      biddingData.bidVolumeRatio >= 10 &&
      (stock.turnoverRate ? stock.turnoverRate >= 5 : true);
  }

  return isConform;
}

/**
 * 将排序转换为 select 的 options数组 并排序
 * @param evenBoardHeightOptions 
 * @returns 
 */
export function transformAndSortEvenBoardHeightOptions(evenBoardHeightOptions: Set<any>) {
  const options = Array.from(evenBoardHeightOptions)
    .map((item: any) => {
      return {
        label: item,
        value: item === '全部' ? -1 : +item,
      };
    })
    .sort((a: any, b: any) => {
      return b.value - a.value;
    });
  options.unshift({
    label: '全部',
    value: -1,
  });
  return options;
}

/**
 * 处理 是否主板、是否创业板 筛选
 * @param stockGroupByGainian 
 */
export const stockTypeFilter = (stock: any, stockTypeOptions: any, stockType: any) => {
  if (stockType === 'all') {
    return stock;
  }
  // 取出筛选条件 codes
  const codes = stockTypeOptions.find(
    (item: { value: string }) => item.value === stockType,
  ).code;

  // 过滤
  return codes.some((code: string) => stock.code.startsWith(code));
};


/**
 * 涨停时间过滤器，上午板 9:30-11:30，下午板 13:00-15:00
 * 按首次上板时间计算
 * @param stockCode  个股代码
 * @param increaseDecline  涨跌幅
 */
export function dailyLimitTimeFilter(dailyTime: string, isMorning: boolean) {
  const aStart = dailyTime.indexOf(',') > -1 ? dailyTime.split(',')[0] : dailyTime;

  // 上午板
  const morningLimit = dayjs('2023-09-05' + aStart).isBefore(dayjs('2023-09-05 12:00:00'))

  return isMorning ? morningLimit : !morningLimit;
}