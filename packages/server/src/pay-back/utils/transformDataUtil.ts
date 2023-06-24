
import { DailyLimitStockDto } from '../dto/daily-limit-stock.dto';
import { DownLimitStockDto } from '../dto/down-limit-stock.dto';
import { toFixed, fundsToFixed } from './commonUtil';
import * as dayjs from 'dayjs';

export function transformStockData(stockList) {
  return JSON.stringify(stockList.map(item => {
    return {
      code: item.code,
      name: item.name,
      rise_and_fall: toFixed(item.rise_and_fall),
      tag: item.tag?.concept_tag,
      hot_tag: item.tag?.popularity_tag,
    }
  }));
}

export function transformPlateData(plateList) {
  return JSON.stringify(plateList.map(item => {
    return {
      code: item.code,
      name: item.name,
      rise_and_fall: toFixed(item.rise_and_fall),
      hot_tag: item.hot_tag,
      tag: item.tag,
    }
  }));
}

/**
 * 转换跌停数据
 * @param dailyLimitData 
 * @param todayDateStr 
 * @returns 
 */
function transDownLimitData(dailyLimitData, todayDateStr) {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
  const downLimitData = [];
  dailyLimitData.forEach(item => {
    const dailyLimitStockDto = new DownLimitStockDto();
    dailyLimitStockDto.name = item['股票简称'];
    dailyLimitStockDto.code = item.code;
    dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
    // 封板资金 单位 亿
    dailyLimitStockDto.closingFunds = fundsToFixed(item[`跌停封单额[${currentDate}]`]);
    downLimitData.push(dailyLimitStockDto);
  });

  return downLimitData;
};

/**
 * 判断类型
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

export function transformShortTermSourceData(dailyLimitData, downLimitData, todayDateStr) {
  const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
  const evenBoardLabel = `连续涨停天数[${currentDate}]`;
  let SZAmount = 0, SHAmount = 0, board1 = 0, maxHeight = 1, currentLevel = 0;
  // 跌停数据
  const downLimitDataArr = transDownLimitData(downLimitData, todayDateStr);
  let evenBoardData = { maxHeight: 1, gaobiao: [] };
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
    // 连板的数据
    if (item['股票代码'].includes('SZ')) {
      SZAmount++;
    } else {
      SHAmount++;
    }

    dailyLimitStockDto.name = item['股票简称'];
    dailyLimitStockDto.code = item.code;
    dailyLimitStockDto.reason = item[`涨停原因类别[${currentDate}]`];
    dailyLimitStockDto.plateLevel2 = item['所属同花顺二级行业'];
    // 封板资金 单位 亿
    dailyLimitStockDto.closingFunds = fundsToFixed(item[`涨停封单额[${currentDate}]`]);
    dailyLimitStockDto.type = judgeType(item['最新涨跌幅']);
    dailyLimitStockDto.price = item['最新价'];
    // 开板次数，如果未开板 则不保存
    if (item[`涨停开板次数[${currentDate}]`] !== 0) {
      dailyLimitStockDto.openTimes = item[`涨停开板次数[${currentDate}]`];
    }
    // 流通市值
    dailyLimitStockDto.circulationValue = fundsToFixed(item[`a股市值(不含限售股)[${currentDate}]`]);
    dailyLimitStockDto.dailyTime = item[`首次涨停时间[${currentDate}]`].trim();
    if (dailyLimitStockDto.openTimes > 0) {
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
    SZAmount,
    SHAmount,
    board1,
    maxHeight,
    evenBoardData,
    downLimitDataArr
  }
}