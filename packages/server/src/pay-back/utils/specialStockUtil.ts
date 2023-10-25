import { transformBidData, transformNewStockData, transformStrongStockData } from './transformDataUtil';
import { params } from '../core/config';
import { fetchIwencaiApi } from '../core/fetchUtil';

/**
 * 自动剔除低于预期的昨日涨停个股（首板），集合竞价开盘价低于预期， 且成交量不足，未匹配量；
 */
export async function getBiddingData(todayDateStr, yesterdayDateStr) {
  // 选股
  // 集中度更集中，20-120，股价低于30
  // 获取昨日涨停 集合竞价情况，竞价量10倍，评级看多，竞价抢筹
  // 连板概率 90%，75%
  const dailyLimitYesterdayDataRs: any = await fetchIwencaiApi(params.dailyLimitYesterday, 100, false);
  // 竞价看多数据 1进2
  // const chooseStock1to2: any = await fetchIwencaiApi(params.chooseStock1to2, 100, false);
  // console.log(params.chooseStock1Expected);
  // 竞价看多数据 首板预期
  const chooseStock1ExpectedRs: any = await fetchIwencaiApi(params.chooseStock1Expected, 100, false);
  // 新股数据
  const newStocksRs: any = await fetchIwencaiApi(params.chooseStockNewStock, 100, false);
  // 昨日首板竞价情况
  const dailyLimitYesterdayBidding = transformBidData(dailyLimitYesterdayDataRs, todayDateStr, yesterdayDateStr);
  // // 一进二竞价，看多标的
  // const chooseStock1to2Pds = transformBidData(chooseStock1to2, todayDateStr, yesterdayDateStr);
  // const chooseStock1to2Dtos = chooseStock1to2Pds.filter(stock => {
  //   // 过滤 量比大于10，超预期及符合预期
  //   return stock.bidVolumeRatio >= 10 && (stock.expected != 0);
  // })
  const chooseStock1Expected = transformStrongStockData(chooseStock1ExpectedRs, todayDateStr, yesterdayDateStr);

  // 新股数据
  const newStocks = transformNewStockData(newStocksRs, todayDateStr);

  return { dailyLimitYesterdayBidding, newStocks, chooseStock1Expected };
}