import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { transformShortTermSourceData } from '../utils/transformDataUtil';
import { params } from '../core/config';
import { fetchStocksByIwencai } from '../core/fetchUtil';
import { getCurrentCycle, iWencaiDateFormat } from 'pay-back-core';
import * as dayjs from 'dayjs';

// 最多单页查询100条数据，循环分页查询完整数据 2024-02-17 23:20:40
const dailyLimitNum = 100;
// 跌停个股只需考虑数量，无需所有个股都存储
const downLimitNum = 50;
// 跌停个股只需考虑数量，无需所有个股都存储
const otherNum = 50;

/**
 * 通过接口方式获取热门数据
 * @returns
 */
export async function getShortTermData(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchStocksByIwencai(params.dailyLimitMoreThan1, dailyLimitNum);
  // 跌停数据
  const downLimitData: any = await fetchStocksByIwencai(params.downLimit, downLimitNum);
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchStocksByIwencai(params.dailyLimitOpen, otherNum);
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchStocksByIwencai(params.hugeFall, otherNum);

  return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

export async function getShortTermDataByDate(todayDateStr): Promise<CreatePayBackDto> {
  // 准备涨停数据
  const dailyLimitData: any = await fetchStocksByIwencai(
    params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr),
    dailyLimitNum,
  );
  // 跌停数据
  const downLimitData: any = await fetchStocksByIwencai(
    params.downLimitByDate.replace('${date}', todayDateStr),
    downLimitNum,
  );
  // 涨停打开个股
  const dailyLimitOpenData: any = await fetchStocksByIwencai(
    params.dailyLimitOpenByDate.replace('${date}', todayDateStr),
    otherNum,
  );
  // 跌幅大于等于15的个股
  const hugeFallData: any = await fetchStocksByIwencai(
    params.hugeFallByDate.replace('${date}', todayDateStr),
    otherNum,
  );

  return prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr);
}

/**
 * 准备dto数据
 * @param dailyLimitData
 * @param dailyLimitOpenData
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
function prepareShortTermDto(dailyLimitData, dailyLimitOpenData, downLimitData, hugeFallData, todayDateStr) {
  const createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
  const {
    board1 = 0,
    evenBoardData,
    downLimitDataArr,
    hugeFallDataArr,
    dailyLimitReturnSealQuantity,
  } = transformShortTermSourceData(dailyLimitData.data, downLimitData.data, hugeFallData.data, todayDateStr);

  // 仅存储短线跌停，即’ 资金出逃‘ 类型
  createPayBackDto.downLimitQuantity = downLimitData.length;
  createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
  // 涨停打开数量
  createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
  // 封板率 = 涨停数 / （涨停数 + 涨停打开数）
  createPayBackDto.sealingRate = Math.round(
    (dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length)) * 100,
  );
  // 炸板率 = （涨停打开数 + 涨停未遂数） / 涨停数
  // 炸板率 = 炸板数/<炸板数+涨停数>
  createPayBackDto.dailyLimitReturnSealQuantity = dailyLimitReturnSealQuantity;
  createPayBackDto.marketHeight = evenBoardData.maxHeight;
  createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
  createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
  createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
  createPayBackDto.hugeFallData = JSON.stringify(hugeFallDataArr);
  createPayBackDto.createTime = new Date();
  // 保证hugeFallData 为对象
  createPayBackDto.cycle = getCurrentCycle({ ...createPayBackDto, hugeFallData: hugeFallDataArr });

  return createPayBackDto;
}

/**
 * TODO 这里的数据装载，缺少日期判断，特别是昨日日期判断
 */
export function mergeExtra2ShortTermData(shortTermData: Array<any>, specialStocks: Array<any>) {
  if (shortTermData.length === 0 || specialStocks.length === 0) return shortTermData;
  // 1. 合并竞价数据到短线数据中的 连板数据中
  const shortTermDataLen = shortTermData.length;
  for (let i = 0; i < shortTermDataLen - 1; i++) {
    const currentDate = dayjs(shortTermData[i].createTime).format(iWencaiDateFormat);
    // 今天的竞价数据，与昨天的涨停数据进行组装
    const currentSpecialStock = findBiddingDataByCreateTime(specialStocks, currentDate);
    if (currentSpecialStock && currentSpecialStock.biddingData) {
      // 将今天的竞价数据，装载入昨日涨停数据中
      // TODO 这里的数据装载，缺少日期判断，特别是昨日日期判断
      const evenBoardData = prepareEvenBoardData(
        JSON.parse(shortTermData[i + 1].evenBoardData),
        JSON.parse(currentSpecialStock.biddingData),
      );
      shortTermData[i + 1].evenBoardData = JSON.stringify(evenBoardData);
    }

    if (specialStocks[i]) {
      // 2. 合并新股数据
      shortTermData[i].newStock = specialStocks[i].newStock;
      // 3. 合并选股数据
      shortTermData[i].chooseStock = specialStocks[i].chooseStock;
      shortTermData[i].biddingDataUpdateTime = specialStocks[i].updatedTime;
    }
  }

  return shortTermData;
}
/**
 * 按创建时间找到对应竞价数据
 * @param biddingDatas
 * @param createDate
 * @returns
 */
function findBiddingDataByCreateTime(biddingDatas, createDate) {
  return biddingDatas.find(item => {
    return dayjs(item.createTime).format(iWencaiDateFormat) === createDate;
  });
}

/**
 * 组装连板数据
 */
function prepareEvenBoardData(evenBoardData, currentBiddingData) {
  const maxHeight = evenBoardData.maxHeight;
  // 遍历短线连板数据，将竞价数据装载进去，按照code 匹配
  for (let currentHeight = 1; currentHeight <= maxHeight; currentHeight++) {
    evenBoardData[currentHeight] &&
      (evenBoardData[currentHeight] = evenBoardData[currentHeight].map(item => {
        // 找到对应个股竞价数据
        const biddingData =
          currentBiddingData.find(biddingItem => {
            return biddingItem.code === item.code;
          }) || {};
        // 竞价数据
        item.biddingData = biddingData;
        return item;
      }));
  }

  return evenBoardData;
}
