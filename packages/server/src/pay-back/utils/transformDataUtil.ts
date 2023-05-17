
import { DailyLimitStockDto } from '../dto/daily-limit-stock.dto';
import * as dayjs from 'dayjs';

export default {
  transformShortTermSourceData(dailyLimitData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const evenBoardLabel = `连续涨停天数[${currentDate}]`;
    let SZAmount = 0, SHAmount = 0, board1 = 0, maxHeight = 1, currentLevel = 0;
    let evenBoardData = { maxHeight: 1, gaobiao: [] }
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
      dailyLimitStockDto.closingFunds = item[`涨停封单额[${currentDate}]`];
      dailyLimitStockDto.turnover = item[`成交额[${currentDate}]`];
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
    }
  },
}