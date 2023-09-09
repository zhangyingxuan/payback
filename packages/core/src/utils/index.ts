import dayjs from 'dayjs';

export function getCurrentCycle(item: any) {
  // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
  // 2、发酵；3、分歧转一致；4、加速；5、分歧转一致；6、加速；7、见顶；8、调整；9、反包；
  // 高度>=5；连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
  // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
  // 4、衰退：总龙头见顶，高位连板股出现亏钱效应
  // 5、冰点：
  // 周期定义
  const cycles = ['启动', '发酵', '高潮', '退潮', '冰点'];
  // 最大高度 item.evenBoardData
  const maxHeight: any = item.marketHeight;
  // 跌幅大于15的个股
  const hugeFallNum = item.hugeFallData ? item.hugeFallData.length : 0;
  // 跌停数量
  if (maxHeight <= 4) {
    if (item.downLimitQuantity > 10) {
      return cycles[4];
    }
    // 今天的最高板没有昨天高，昨天是高潮
    if (maxHeight === 4 && hugeFallNum == 0) {
      return cycles[0];
    }
    return cycles[3];
  }
  if (maxHeight >= 5) {
    // 高潮前提，不能有连板负反馈
    if (item.evenBoardAmount >= 10 || item.dailyLimitQuantity >= 45) {
      return cycles[2];
    }
    return cycles[1];
  }
}

export const dailyLimitOptionalStrategyStr = '流通市值大于等于20亿，小于等于120亿，主板个股，股价低于30';

/**
 * 涨停自选策略
 * 连板全部加入
 * 策略备注：参考 dailyLimitOptionalStrategyStr
 */
export function dailyLimitOptionalStrategy(stock: any, currentLevel: number | string) {
  // 创业板、科创板 30*、688、83* 不自选
  if (stock.code.startsWith('3') || stock.code.startsWith('688') || stock.code.startsWith('83')) return false;
  // 连板全部加入
  if (currentLevel != 1) return true;
  return stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}


// 星火集合竞价成交量放大到和首板涨停爆量相同最佳，如果放大到2/3也可以，最差也要放量到一半，如果缩量就没有参与价值。
const currentDate = '2018-08-08'; // dayjs().format('YYYY-MM-DD');
// 9.31
const date931 = dayjs(currentDate + ' 09:31:00');
// 10:01
const date1000 = dayjs(currentDate + ' 10:00:00');
// 13:00
const date1300 = dayjs(currentDate + ' 13:00:00');
const date1400 = dayjs(currentDate + ' 14:00:00');
const expectedArr = ['5', '4', '3', '0,2', '-2,2', '-2'];
/**
 * 根据开板次数，最终涨停时间 给出次日开盘预期
 * @param stock {openTimes: string, dailyTime: string, }
 * @returns 
 */
export function getExpected(stock: any) {
  let currentTime: any = stock.openTimes ? stock.dailyTime.split(',')[1] : stock.dailyTime;
  // console.log(stock.name, stock.openTimes, stock.dailyTime, currentTime);

  currentTime = dayjs(currentDate + ' ' + currentTime);
  // 文心一言
  // 1、昨日一字板或开盘秒板的。第二天正常预期高开5%以上。
  // 2、昨日10点前涨停的，第二天正常预期高开4%左右。
  // 3、昨日11点半前涨停的，第二天正常预期高开3%左右。
  // 4、昨日午后13-14涨停的，第二天预期微高开（0—2%）
  // 5、昨日午后14之后涨停的，第二天预期平开（-2%—2%）
  // 6、昨日烂板（开板5次），第二天预计低开（0--2%）

  if (stock.openTimes >= 5) {
    // 最终封板时间，在早盘则按正常预期，否则低开
    if (currentTime.isBefore(date1300)) {
      return expectedArr[2];
    }
    return expectedArr[5];
  }

  if (currentTime.isBefore(date931)) {
    return expectedArr[0];
  }
  if (currentTime.isBefore(date1000)) {
    return expectedArr[1];
  }
  if (currentTime.isBefore(date1300)) {
    return expectedArr[2];
  }
  if (currentTime.isBefore(date1400) && currentTime.isAfter(date1300)) {
    return expectedArr[3];
  }
  return expectedArr[4];
}

export default { getCurrentCycle, dailyLimitOptionalStrategy, getExpected };