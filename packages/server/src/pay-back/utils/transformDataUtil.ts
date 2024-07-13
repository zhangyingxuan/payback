import { DailyLimitStockDto } from '../dto/daily-limit-stock.dto';
import { DownLimitStockDto } from '../dto/down-limit-stock.dto';
import { StrongStockDto } from '../dto/strong-stock.dto';
import { DailyLimitYesterdayBiddingDto } from '../dto/daily-limit-yesterday-bidding.dto';
import { NewStockDto } from '../dto/new-stock.dto';
import { toFixed, fundsToFixed, getLastTradingDay } from './commonUtil';
import * as dayjs from 'dayjs';
import { getExpected } from 'pay-back-core';

const turnoverTypeArr = ['放量涨停', '缩量涨停', '一字涨停', 'T字涨停'];
export enum ExpectEnum {
  // 符合预期
  conformTo = 1,
  // 超预期
  exceed = 2,
  // 不及预期
  incompatible = 0,
}

export function transformStockData(stockList) {
  return stockList.map(item => {
    return {
      code: item.code,
      name: item.name,
      rise_and_fall: toFixed(item.rise_and_fall),
      tag: item.tag?.concept_tag,
      hot_tag: item.tag?.popularity_tag,
    };
  });
}

export function transformPlateData(plateList) {
  return plateList.map(item => {
    return {
      code: item.code,
      name: item.name,
      rise_and_fall: toFixed(item.rise_and_fall),
      hot_tag: item.hot_tag,
      tag: item.tag,
    };
  });
}

/**
 * 转换跌停数据
 * @param dailyLimitData
 * @param todayDateStr
 * @returns
 */
function transformHugeFallData(hugeFallData) {
  const hugeFallDataArr = [];

  hugeFallData &&
    hugeFallData.forEach(item => {
      const downLimitStockDto = new DownLimitStockDto();
      loadStockBaseData(downLimitStockDto, item);
      hugeFallDataArr.push(downLimitStockDto);
    });

  return {
    hugeFallDataArr,
  };
}
/**
 * 转换跌停数据
 * @param dailyLimitData
 * @param todayDateStr
 * @returns
 */
function transformDownLimitData(dailyLimitData, currentDate) {
  const downLimitDataArr = [];

  dailyLimitData &&
    dailyLimitData.forEach(item => {
      const downLimitStockDto = new DownLimitStockDto();
      // 个股基础信息
      loadStockBaseData(downLimitStockDto, item);

      if (item[`跌停原因类型[${currentDate}]`] && item[`跌停原因类型[${currentDate}]`] !== '资金出逃') {
        downLimitStockDto.reason = item[`跌停原因类型[${currentDate}]`];
      }
      // else {
      //   // 短线跌停 +1
      //   downLimitQuantity++;
      // }
      // 封板资金 单位 亿
      downLimitStockDto.closingFunds = fundsToFixed(item[`跌停封单额[${currentDate}]`]);
      downLimitDataArr.push(downLimitStockDto);
    });

  return downLimitDataArr;
}

/**
 * 转换涨停数据
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
function transformDailyLimitData(dailyLimitData, dailyLimitGroupByGainainData, currentDate) {
  let board1 = 0,
    maxHeight = 1,
    currentLevel = 1,
    jitianjiban = '',
    dailyLimitReturnSealQuantity = 0;
  const evenBoardData = { maxHeight: 1, gaobiao: [], yizi: 0 };
  const evenBoardLabel = `连续涨停天数[${currentDate}]`;

  dailyLimitData &&
    dailyLimitData.forEach(item => {
      const dailyLimitStockDto = new DailyLimitStockDto();

      // 个股基础信息
      loadStockBaseData(dailyLimitStockDto, item, currentDate);

      // 封板资金 单位 亿
      dailyLimitStockDto.closingFunds = fundsToFixed(item[`涨停封单额[${currentDate}]`]);
      dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
      dailyLimitStockDto.turnoverRate = toFixed(item[`换手率[${currentDate}]`], 1);

      // 默认都是放量涨停，不记录
      if (item[`涨停类型[${currentDate}]`] !== turnoverTypeArr[0]) {
        // 成交量类型
        dailyLimitStockDto.turnoverType = item[`涨停类型[${currentDate}]`];
        dailyLimitStockDto.turnoverType &&
          dailyLimitStockDto.turnoverType.indexOf(turnoverTypeArr[2]) > -1 &&
          evenBoardData.yizi++;
      }
      // 开板次数，如果未开板 则不保存
      if (item[`涨停开板次数[${currentDate}]`] != 0) {
        dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
        dailyLimitReturnSealQuantity++;
      }
      dailyLimitStockDto.dailyTime = item[`首次涨停时间[${currentDate}]`]
        ? item[`首次涨停时间[${currentDate}]`].trim()
        : '-';
      if (dailyLimitStockDto.openTimes > 0 && item[`最终涨停时间[${currentDate}]`]) {
        dailyLimitStockDto.dailyTime += ',' + item[`最终涨停时间[${currentDate}]`].trim();
      }
      // 计算 涨停所属概念
      dailyLimitStockDto.gainian = getGainianByCode(dailyLimitGroupByGainainData, dailyLimitStockDto.code);

      // 当前股票 连板高度 -- 优化竞价时无法获取当前高度的问题，合并为高标 2024-05-06 15:50:18
      currentLevel = item[evenBoardLabel] || 1;
      // 如果是 断板连板 则统计几天几板
      jitianjiban = item[`几天几板[${currentDate}]`];

      if (jitianjiban && jitianjiban.indexOf('天') > -1) {
        const day = +jitianjiban.split('天')[0];
        const even = +jitianjiban.split('天')[1].replace('板', '');

        if (day !== even) {
          dailyLimitStockDto.evenDays = jitianjiban;
          evenBoardData.gaobiao.push(dailyLimitStockDto);
          // 如果 竞价 未取出当前高度，则使用几天几板的高度
          !currentLevel && (currentLevel = 1);
        } else {
          // 如果 竞价 未取出当前高度，则使用几天几板的高度
          !currentLevel && (currentLevel = even);
        }
      }
      if (currentLevel > maxHeight) {
        maxHeight = currentLevel;
      }
      // 累加首板数量，用于计算连板个数
      if (currentLevel === 1) {
        board1++;
      }
      !evenBoardData[currentLevel] && (evenBoardData[currentLevel] = []);
      evenBoardData[currentLevel].push(dailyLimitStockDto);
    });
  evenBoardData.maxHeight = maxHeight;
  evenBoardData.gaobiao.length === 0 && delete evenBoardData.gaobiao;

  return {
    board1,
    evenBoardData,
    dailyLimitReturnSealQuantity,
  };
}

/**
 * 获取 当前个股所属 涨停概念
 * @param dailyLimitGroupByGainainData
 * @param code
 * @returns
 */
function getGainianByCode(dailyLimitGroupByGainainData, code) {
  if (!dailyLimitGroupByGainainData || dailyLimitGroupByGainainData.length === 0) return;
  let gainian = '';
  dailyLimitGroupByGainainData.forEach(item => {
    // 概念code概念名 name
    if (item.stock_list && item.stock_list.some(stock => stock.code === code)) {
      gainian && (gainian += ',');
      gainian += `${item.name}:${item.code}`;
    }
  });
  return gainian;
}

/**
 * 转换早盘 昨日首板 集合竞价数据
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
export function transformBidData(stocks, todayDateStr, yesterdayDate): Array<DailyLimitYesterdayBiddingDto> {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
  const dailyLimitYesterdayBiddingDtos: DailyLimitYesterdayBiddingDto[] = [];

  stocks.forEach(item => {
    const dailyLimitYesterdayBiddingDto = new DailyLimitYesterdayBiddingDto();
    // 个股基础信息
    loadStockBaseData(dailyLimitYesterdayBiddingDto, item, currentDate);
    // 竞价基础数据 加载
    loadBiddingBaseData(dailyLimitYesterdayBiddingDto, item, currentDate);
    // 收盘涨幅
    dailyLimitYesterdayBiddingDto.closeIncrease = toFixed(item['最新涨跌幅']);

    // 如果是 断板连板 则统计几天几板
    const jitianjiban = item[`几天几板[${yesterdayDate}]`];
    // 取出 两个数字，如果不一致 则存入 evenDays字段
    if (jitianjiban && jitianjiban.indexOf('天') > -1) {
      const day = jitianjiban.split('天')[0];
      const even = jitianjiban.split('天')[1].replace('板', '');
      if (day !== even) {
        dailyLimitYesterdayBiddingDto.evenDays = jitianjiban;
      } else {
        dailyLimitYesterdayBiddingDto.evenDays = day;
      }
    }

    // 计算 竞价量比、预期差
    // 纠错环节，判断昨日日期是否正确
    if (!item[`最终涨停时间[${yesterdayDate}]`]) {
      yesterdayDate = getLastTradingDay(currentDate);
    }

    // 竞价量比
    dailyLimitYesterdayBiddingDto.bidVolumeRatio = +(
      item[`竞价量[${currentDate}]`] / item[`竞价量[${yesterdayDate}]`]
    ).toFixed(2);
    // 昨日涨停开板次数/涨停时间，便于预期差统计
    if (item[`涨停开板次数[${yesterdayDate}]`] != 0) {
      dailyLimitYesterdayBiddingDto.openTimes = item[`涨停开板次数[${yesterdayDate}]`];
    }
    dailyLimitYesterdayBiddingDto.dailyTime = item[`首次涨停时间[${yesterdayDate}]`]
      ? item[`首次涨停时间[${yesterdayDate}]`].trim()
      : '-';
    if (dailyLimitYesterdayBiddingDto.openTimes > 0 && item[`最终涨停时间[${yesterdayDate}]`]) {
      dailyLimitYesterdayBiddingDto.dailyTime += ',' + item[`最终涨停时间[${yesterdayDate}]`].trim();
    }

    // 竞价涨幅预期值
    dailyLimitYesterdayBiddingDto.expected = judgeExpected(dailyLimitYesterdayBiddingDto);

    delete dailyLimitYesterdayBiddingDto.dailyTime;
    delete dailyLimitYesterdayBiddingDto.openTimes;

    dailyLimitYesterdayBiddingDtos.push(dailyLimitYesterdayBiddingDto);
  });

  return dailyLimitYesterdayBiddingDtos;
}

/**
 * 转换早盘 新股竞价数据
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
export function transformNewStockData(stocks, todayDateStr): Array<NewStockDto> {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
  const newStockDtos: NewStockDto[] = [];

  stocks.forEach(item => {
    const newStock = new NewStockDto();
    // 个股基础信息
    loadStockBaseData(newStock, item, currentDate);
    // 将竞价基础数据填入 参数中
    loadBiddingBaseData(newStock, item, currentDate);
    // 收盘涨幅
    newStock.closeIncrease = toFixed(item['最新涨跌幅']);
    newStockDtos.push(newStock);
  });

  return newStockDtos;
}
/**
 * 转换早盘 强势股竞价数据
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
export function transformStrongStockData(stocks, todayDateStr, yesterdayDate): Array<StrongStockDto> {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
  const strongStockDtos: StrongStockDto[] = [];

  stocks.forEach(item => {
    const strongStockDto = new StrongStockDto();
    // 个股基础信息
    loadStockBaseData(strongStockDto, item, currentDate);
    // 将竞价基础数据填入 参数中
    loadBiddingBaseData(strongStockDto, item, currentDate);
    if (!strongStockDto.price) {
      strongStockDto.price = item[`平均成本[${currentDate}]`] || item[`平均成本[${yesterdayDate}]`];
    }
    // 换手率
    strongStockDto.turnoverRate = toFixed(item[`换手率[${yesterdayDate}]`], 1);
    // 筹码集中度
    strongStockDto.cmjzd = toFixed(item[`集中度70[${currentDate}]`] || item[`集中度70[${yesterdayDate}]`], 1);
    // 收盘获利
    strongStockDto.sphl = toFixed(item[`收盘获利[${yesterdayDate}]`], 1);
    // 收盘涨幅
    strongStockDto.closeIncrease = toFixed(item['最新涨跌幅']);
    strongStockDtos.push(strongStockDto);
  });

  return strongStockDtos;
}

/**
 * 转换短线数据
 *
 * @param dailyLimitData
 * @param downLimitData
 * @param todayDateStr
 * @returns
 */
export function transformShortTermSourceData(
  dailyLimitData,
  downLimitData,
  hugeFallData,
  dailyLimitGroupByGainainData,
  todayDateStr,
) {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');

  // 跌停数据
  const downLimitDataArr = transformDownLimitData(downLimitData, currentDate);
  // 跌幅大于等于15的个股
  const { hugeFallDataArr } = transformHugeFallData(hugeFallData);
  // 涨停数据
  const { board1, evenBoardData, dailyLimitReturnSealQuantity } = transformDailyLimitData(
    dailyLimitData,
    dailyLimitGroupByGainainData,
    currentDate,
  );

  return {
    board1,
    evenBoardData,
    downLimitDataArr,
    hugeFallDataArr,
    dailyLimitReturnSealQuantity,
  };
}

/**
 * 准备竞价基础数据
 */
function loadBiddingBaseData(stock, item, currentDate) {
  // 竞价异动类型
  stock.bidChangeTypeT = item[`竞价异动类型[${currentDate}]`];
  // 竞价涨幅
  stock.bidIncreaseT = item[`竞价涨幅[${currentDate}]`];
  // 今日 竞价评级
  stock.bidRating = item[`集合竞价评级[${currentDate}]`];

  return stock;
}

/**
 * 准备个股基础数据
 */
function loadStockBaseData(stock, item, currentDate = null) {
  stock.name = item['股票简称'];
  // 编码
  stock.code = item.code;
  stock.plateLevel2 = getPlateLevel2(item);
  if (currentDate) {
    // 股价
    stock.price = item['最新价'];
    // 流通市值
    stock.circulationValue = fundsToFixed(item[`a股市值(不含限售股)[${currentDate}]`]);
  }

  return stock;
}

/**
 *  获取二级行业
 * @param item
 * @returns
 */
function getPlateLevel2(item) {
  if (item['所属同花顺二级行业']) {
    return item['所属同花顺二级行业'];
  }

  return item['所属同花顺行业'] ? item['所属同花顺行业'].split('-')[1] : '未知';
}

/**
 * 预期值：不符合预期0;符合预期1;超预期2
 * @param item
 * @param bidIncreaseT
 * @returns
 */
function judgeExpected(item) {
  // 9.25-9.30 期间，竞价涨幅数据 仅为 9.25数据 不为开盘数据
  const { bidIncreaseT } = item;
  // 获取预期值
  const expected = getExpected(item);
  // 在范围内符合预期，超出1个点，则超预期
  if (expected.indexOf(',') === -1) {
    const expectedD = parseInt(expected);
    // 0.1个点误差，符合预期 2024-06-24 19:39:39
    if (bidIncreaseT > expectedD || expectedD - bidIncreaseT <= 0.1) {
      if (bidIncreaseT - expectedD >= 1) {
        return ExpectEnum.exceed;
      }
      // 符合预期
      return ExpectEnum.conformTo;
    }
    // 不及预期
    return ExpectEnum.incompatible;
  } else {
    const expecteds = expected.split(',');
    const start = parseInt(expecteds[0]);
    const end = parseInt(expecteds[1]);
    if (bidIncreaseT >= start && bidIncreaseT <= end) {
      // 符合预期
      return ExpectEnum.conformTo;
    }
    if (bidIncreaseT > end) {
      // 超预期
      return ExpectEnum.exceed;
    }
    // 不及预期
    return ExpectEnum.incompatible;
  }
}

/**
 * 获取 北向 南向资金数据
 * @param response
 * @returns
 */
export function transformForeignFunds(dataStr) {
  // 单位 万元
  // 净流入
  let northFundsAmtIn = 0;
  let southFundsAmtIn = 0;
  // 净买入
  let northFundsBuyAmt = 0;
  let southFundsBuyAmt = 0;
  try {
    dataStr = dataStr.substring(dataStr.indexOf('(') + 1, dataStr.length - 2);
    const dataJson = JSON.parse(dataStr);
    const data = dataJson.result.data;
    // FUNDS_DIRECTION 北向、南向
    data.forEach(item => {
      if (item.FUNDS_DIRECTION === '北向') {
        northFundsAmtIn += item.dayNetAmtIn;
        northFundsBuyAmt += item.netBuyAmt;
      } else {
        southFundsAmtIn += item.dayNetAmtIn;
        southFundsBuyAmt += item.netBuyAmt;
      }
    });
  } catch (e) {
    console.log('[error]transformForeignFunds数据转换错误！');
  }

  return {
    northFundsAmtIn,
    southFundsAmtIn,
    northFundsBuyAmt,
    southFundsBuyAmt,
  };
}

/**
 * 获取 北向 南向资金数据 新 2024-05-15 21:27:29
 * @param response
 * @returns
 */
export function transformForeignFundsNew(dataStr) {
  // 单位 万元
  // 净流入
  let northFundsAmtIn = 0;
  let southFundsAmtIn = 0;
  // 净买入
  let northFundsBuyAmt = 0;
  let southFundsBuyAmt = 0;
  try {
    dataStr = dataStr.substring(dataStr.indexOf('(') + 1, dataStr.length - 2);
    const dataJson = JSON.parse(dataStr);
    const data = dataJson.data;
    const currentDate = dayjs().format('YYYYMMDD');

    // 如果不是当天的数据则跳过
    if (data.hk2sh.buySellAmtDate == currentDate) {
      northFundsAmtIn = data.hk2sh.dayNetAmtIn + data.hk2sz.dayNetAmtIn;
      northFundsBuyAmt = data.hk2sh.netBuyAmt + data.hk2sz.netBuyAmt;
      southFundsAmtIn = data.sh2hk.dayNetAmtIn + data.sz2hk.dayNetAmtIn;
      southFundsBuyAmt = data.sh2hk.netBuyAmt + data.sz2hk.netBuyAmt;
    }
  } catch (e) {
    console.log('[error]transformForeignFunds数据转换错误！');
  }

  return {
    northFundsAmtIn,
    southFundsAmtIn,
    northFundsBuyAmt,
    southFundsBuyAmt,
  };
}
