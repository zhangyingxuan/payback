
import { DailyLimitStockDto } from '../dto/daily-limit-stock.dto';
import * as dayjs from 'dayjs';

export default {
  transformShortTermSourceData(dailyLimitData, todayDateStr) {
    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const evenBoardLabel = `连续涨停天数[${currentDate}]`;
    let SZAmount = 0, SHAmount = 0, board1 = 0, maxHeight = 1, currentLevel = 0;
    let evenBoardData = { maxHeight: 1 }
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
      !evenBoardData[currentLevel] && (evenBoardData[currentLevel] = []);
      evenBoardData[currentLevel].push(dailyLimitStockDto)
    });
    evenBoardData.maxHeight = maxHeight;
    return {
      SZAmount,
      SHAmount,
      board1,
      maxHeight,
      evenBoardData,
    }
  }
}