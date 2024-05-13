import { transformBidData, transformNewStockData, transformStrongStockData } from './transformDataUtil';
import { params } from '../core/config';
import { fetchAllStocksByIwencai } from '../core/fetchUtil';

/**
 * 获取昨日涨停 今日竞价数据
 */
export async function fetchLastdayDailyLimitBinddingData(todayDateStr, yesterdayDateStr) {
  const dailyLimitYesterdayDataRs: any = await fetchAllStocksByIwencai(params.dailyLimitYesterday);
  const dailyLimitYesterdayBidding = transformBidData(dailyLimitYesterdayDataRs.data, todayDateStr, yesterdayDateStr);
  return dailyLimitYesterdayBidding;
}

export async function fetchSpecialStockBinddingData(todayDateStr, yesterdayDateStr) {
  // 竞价看多数据 1进2
  // const chooseStock1to2: any = await fetchAllStocksByIwencai(params.chooseStock1to2, chooseStock1Expected, false);
  // console.log(params.chooseStock1Expected);
  // 竞价看多数据 首板预期
  const chooseStock1ExpectedRs: any = await fetchAllStocksByIwencai(params.chooseStock1Expected);
  // 新股数据
  const newStocksRs: any = await fetchAllStocksByIwencai(params.chooseStockNewStock);
  const chooseStock1Expected = transformStrongStockData(chooseStock1ExpectedRs.data, todayDateStr, yesterdayDateStr);

  // 新股数据
  const newStocks = transformNewStockData(newStocksRs.data, todayDateStr);

  return { newStocks, chooseStock1Expected };
}
