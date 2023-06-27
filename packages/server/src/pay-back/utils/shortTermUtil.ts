import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData } from '../utils/transformDataUtil';
import { params } from '../core/config';
import { fetchIwencaiApi } from '../core/fetchUtil';

/**
 * 通过接口方式获取热门数据
 * @returns 
 */
export async function getShortTermData(todayDateStr): Promise<CreatePayBackDto> {
  let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1, 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimit, 50, false);

  let { SZAmount = 0, SHAmount = 0, board1 = 0, evenBoardData, downLimitDataArr } = transformShortTermSourceData(dailyLimitData, downLimitData, todayDateStr);

  createPayBackDto.downLimitQuantity = downLimitData.length;
  createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
  createPayBackDto.marketHeight = evenBoardData.maxHeight;
  createPayBackDto.board1 = board1;
  createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
  createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
  createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
  createPayBackDto.SZAmount = SZAmount;
  createPayBackDto.SHAmount = SHAmount;
  createPayBackDto.createTime = new Date();

  return createPayBackDto;
}
export async function getShortTermDataByDate(todayDateStr): Promise<CreatePayBackDto> {
  let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
  // 准备涨停数据
  const dailyLimitData: any = await fetchIwencaiApi(params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr), 100, false);
  // 跌停数据
  const downLimitData: any = await fetchIwencaiApi(params.downLimitByDate.replace('${date}', todayDateStr), 50, false);


  console.log(params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr))
  let { SZAmount = 0, SHAmount = 0, board1 = 0, evenBoardData, downLimitDataArr } = transformShortTermSourceData(dailyLimitData, downLimitData, todayDateStr);

  createPayBackDto.downLimitQuantity = downLimitData.length;
  createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
  createPayBackDto.marketHeight = evenBoardData.maxHeight;
  createPayBackDto.board1 = board1;
  createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
  createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
  createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
  createPayBackDto.SZAmount = SZAmount;
  createPayBackDto.SHAmount = SHAmount;
  createPayBackDto.createTime = new Date(todayDateStr);

  return createPayBackDto;
}