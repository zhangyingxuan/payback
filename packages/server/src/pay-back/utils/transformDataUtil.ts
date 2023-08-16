
import { DailyLimitStockDto } from '../dto/daily-limit-stock.dto';
import { DownLimitStockDto } from '../dto/down-limit-stock.dto';
import { toFixed, fundsToFixed } from './commonUtil';
import * as dayjs from 'dayjs';

const turnoverTypeArr = ['放量涨停', '缩量涨停', '一字涨停', 'T字涨停'];

export function transformStockData(stockList) {
  return stockList.map(item => {
    return {
      code: item.code,
      name: item.name,
      rise_and_fall: toFixed(item.rise_and_fall),
      tag: item.tag?.concept_tag,
      hot_tag: item.tag?.popularity_tag,
    }
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
    }
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

  hugeFallData.forEach(item => {
    const downLimitStockDto = new DownLimitStockDto();
    downLimitStockDto.name = item['股票简称'];
    downLimitStockDto.code = item.code;
    downLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
    hugeFallDataArr.push(downLimitStockDto);
  });

  return {
    hugeFallDataArr,
  };
};
/**
 * 转换跌停数据
 * @param dailyLimitData 
 * @param todayDateStr 
 * @returns 
 */
function transformDownLimitData(dailyLimitData, currentDate) {
  const downLimitDataArr = [];
  let downLimitQuantity = 0;

  dailyLimitData.forEach(item => {
    const downLimitStockDto = new DownLimitStockDto();
    downLimitStockDto.name = item['股票简称'];
    downLimitStockDto.code = item.code;
    downLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
    if (item[`跌停原因类型[${currentDate}]`] && item[`跌停原因类型[${currentDate}]`] !== '资金出逃') {
      downLimitStockDto.reason = item[`跌停原因类型[${currentDate}]`];
    } else {
      // 短线跌停 +1 
      downLimitQuantity++;
    }
    // 封板资金 单位 亿
    downLimitStockDto.closingFunds = fundsToFixed(item[`跌停封单额[${currentDate}]`]);
    downLimitDataArr.push(downLimitStockDto);
  });

  return {
    downLimitDataArr,
    downLimitQuantity,
  };
};

/**
 * 判断类型，10cm：0 20cm：1 其他：2
 */
function judgeType(str) {
  if (!str) return 2;

  const num = +str;
  if (num < 11) {
    return 0;
  } else if (num >= 11 && num < 21) {
    return 1;
  } else {
    return 2;
  }
}

/**
 * 转换涨停数据
 * @param downLimitData 
 * @param todayDateStr 
 * @returns 
 */
function transformDailyLimitData(dailyLimitData, currentDate) {
  let board1 = 0, maxHeight = 1, currentLevel = 0, dailyLimitReturnSealQuantity = 0;
  let evenBoardData = { maxHeight: 1, gaobiao: [], yizi: 0 };
  const evenBoardLabel = `连续涨停天数[${currentDate}]`;

  dailyLimitData.forEach(item => {
    const dailyLimitStockDto = new DailyLimitStockDto();
    // 当前股票 连板高度
    currentLevel = item[evenBoardLabel];
    if (currentLevel > maxHeight) {
      maxHeight = currentLevel
    }
    // 累加首板数量，用于计算连板个数
    if (currentLevel === 1) {
      board1++;
    }

    dailyLimitStockDto.name = item['股票简称'];
    dailyLimitStockDto.code = item.code;
    dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
    dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
    // 封板资金 单位 亿
    dailyLimitStockDto.closingFunds = fundsToFixed(item[`涨停封单额[${currentDate}]`]);

    // 默认都是放量涨停，不记录
    if (item[`涨停类型[${currentDate}]`] !== turnoverTypeArr[0]) {
      // 成交量类型
      dailyLimitStockDto.turnoverType = item[`涨停类型[${currentDate}]`];
      dailyLimitStockDto.turnoverType && dailyLimitStockDto.turnoverType.indexOf(turnoverTypeArr[2]) > -1 && (evenBoardData.yizi++)
    }
    dailyLimitStockDto.type = judgeType(item['最新涨跌幅']);
    dailyLimitStockDto.price = item['最新价'];
    // 开板次数，如果未开板 则不保存
    if (item[`涨停开板次数[${currentDate}]`] != 0) {
      dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
      dailyLimitReturnSealQuantity++;
    }
    // 流通市值
    dailyLimitStockDto.circulationValue = fundsToFixed(item[`a股市值(不含限售股)[${currentDate}]`]);
    dailyLimitStockDto.dailyTime = item[`首次涨停时间[${currentDate}]`] ? item[`首次涨停时间[${currentDate}]`].trim() : '-';
    if (dailyLimitStockDto.openTimes > 0 && item[`最终涨停时间[${currentDate}]`]) {
      dailyLimitStockDto.dailyTime += (',' + item[`最终涨停时间[${currentDate}]`].trim());
    }
    // 如果是 断板连板 则统计几天几板
    const jitianjiban = item[`几天几板[${currentDate}]`];
    // 取出 两个数字，如果不一致 则存入 evenDays字段
    if (jitianjiban && jitianjiban.indexOf('天') > -1) {
      const day = jitianjiban.split('天')[0];
      const even = jitianjiban.split('天')[1].replace('板', '');
      if (day !== even) {
        dailyLimitStockDto.evenDays = jitianjiban;
        evenBoardData.gaobiao.push(dailyLimitStockDto);
      }
    }
    !evenBoardData[currentLevel] && (evenBoardData[currentLevel] = []);
    evenBoardData[currentLevel].push(dailyLimitStockDto)
  });
  evenBoardData.maxHeight = maxHeight;
  evenBoardData.gaobiao.length === 0 && delete evenBoardData.gaobiao

  return {
    board1,
    evenBoardData,
    dailyLimitReturnSealQuantity,
  }
}

/**
 * 转换短线数据
 * 
 * @param dailyLimitData 
 * @param downLimitData 
 * @param todayDateStr 
 * @returns 
 */
export function transformShortTermSourceData(dailyLimitData, downLimitData, hugeFallData, todayDateStr) {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');

  // 跌停数据
  const { downLimitDataArr, downLimitQuantity } = transformDownLimitData(downLimitData, currentDate);
  // 跌幅大于等于15的个股
  const { hugeFallDataArr } = transformHugeFallData(hugeFallData);
  // 涨停数据
  const { board1,
    evenBoardData,
    dailyLimitReturnSealQuantity } = transformDailyLimitData(dailyLimitData, currentDate);

  return {
    board1,
    evenBoardData,
    downLimitDataArr,
    hugeFallDataArr,
    downLimitQuantity,
    dailyLimitReturnSealQuantity,
  }
}