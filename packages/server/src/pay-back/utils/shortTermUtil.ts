import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData } from '../utils/transformDataUtil';
import { params } from '../core/config';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { getCurrentCycle } from 'pay-back-core';

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
  createPayBackDto.cycle = getCurrentCycle(createPayBackDto);

  return createPayBackDto;
}