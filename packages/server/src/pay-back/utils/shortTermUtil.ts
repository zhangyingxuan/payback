import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData, transformBidData } from '../utils/transformDataUtil';
import { params } from '../core/config';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { getCurrentCycle } from 'pay-back-core';
import * as dayjs from 'dayjs';
/**
 * 通过接口方式获取热门数据
 * @returns 
 */
export async function getShortTermData(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1, 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimit, 50, false);
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchIwencaiApi(params.dailyLimitOpen, 50, false);
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchIwencaiApi(params.hugeFall, 50, false);

  return prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

export async function getShortTermDataByDate(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr), 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimitByDate.replace('${date}', todayDateStr), 50, false);
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchIwencaiApi(params.dailyLimitOpenByDate.replace('${date}', todayDateStr), 50, false);
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchIwencaiApi(params.hugeFallByDate.replace('${date}', todayDateStr), 50, false);

  return prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

/**
 * 自动剔除低于预期的昨日涨停个股（首板），集合竞价开盘价低于预期， 且成交量不足，未匹配量；
 */
export async function autoRemoveLessThanExpect() {
  // 选股
  // 集中度更集中，20-120，股价低于30
  // 获取昨日涨停 集合竞价情况，竞价量10倍，评级看多，竞价抢筹
  // 连板概率 90%，75%
  const dailyLimitYesterdayData: any = await fetchIwencaiApi(params.dailyLimitYesterday, 100, false);
}

/**
 * 自动剔除低于预期的昨日涨停个股（首板），集合竞价开盘价低于预期， 且成交量不足，未匹配量；
 */
export async function getBiddingData(todayDateStr) {
  // 选股
  // 集中度更集中，20-120，股价低于30
  // 获取昨日涨停 集合竞价情况，竞价量10倍，评级看多，竞价抢筹
  // 连板概率 90%，75%
  const dailyLimitYesterdayData: any = await fetchIwencaiApi(params.dailyLimitYesterday, 100, false);

  return transformBidData(dailyLimitYesterdayData, todayDateStr);;
}

/**
 * 准备dto数据
 * @param dailyLimitData 
 * @param dailyLimitOpenData 
 * @param downLimitData 
 * @param todayDateStr 
 * @returns 
 */
function prepareDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr) {
  let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
  let { board1 = 0, evenBoardData, downLimitDataArr, hugeFallDataArr, dailyLimitReturnSealQuantity, downLimitQuantity } = transformShortTermSourceData(dailyLimitData, downLimitData, hugeFallData, todayDateStr);

  // 仅存储短线跌停，即’ 资金出逃‘ 类型
  createPayBackDto.downLimitQuantity = downLimitQuantity;
  createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
  // 涨停打开数量
  createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
  // 封板率 = 涨停数 / （涨停数 + 涨停打开数）
  createPayBackDto.sealingRate = Math.round(dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length) * 100);
  // 炸板率 = （涨停打开数 + 涨停未遂数） / 涨停数
  // 炸板率 = 炸板数/<炸板数+涨停数>
  createPayBackDto.dailyLimitReturnSealQuantity = dailyLimitReturnSealQuantity;
  createPayBackDto.marketHeight = evenBoardData.maxHeight;
  createPayBackDto.board1 = board1;
  createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
  createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
  createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
  createPayBackDto.hugeFallData = JSON.stringify(hugeFallDataArr);
  createPayBackDto.createTime = new Date();
  // 保证hugeFallData 为对象
  createPayBackDto.cycle = getCurrentCycle({ ...createPayBackDto, hugeFallData: hugeFallDataArr });

  return createPayBackDto;
}