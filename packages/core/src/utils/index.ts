import dayjs from 'dayjs';

const config = {
  // 启动连板高度 要求
  startUpHeight: 4,
  // 连板数量
  evenBoardNum: 10,
  dailyLimitNum: 45,
  downLimitNum: 10,
}

/**
 * 需要参考昨日数据 结合两天数据比较 高度变化
 * 高度下降(退潮、冰点)、高度上升（启动、发酵、高潮）
 * @param currentTradingDayData 
 * @returns  调整策略 风险 > 机会 2024-04-07 18:18:08
 */
export function getCurrentCycle(currentTradingDayData: any, lastTradingDayData: any) {
  // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
  // 2、发酵；带动板块，赚钱效应启动，并出现涨停潮（情绪发酵期是龙头股选手大展身手、上仓位的最关键阶段），连板股数量>=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
  // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
  // 4、衰退：总龙头见顶，高位连板股出现亏钱效应，炸板大面票、昨日涨停今天跌停、昨日涨停今天闷杀的票批量出现，尤其高位炸板股增多，极端的出现天地板等大面
  // 5、冰点：竞价低开，瀑布大面，总龙头继续杀跌，无赚钱效应。连板高度受压制 3/4板高度。虽然还是会有个股走出连板，但连板数量相对于前面的阶段骤然降低，跌停家数比较高，龙头杀跌（回撤20-30%），一些补涨股继续杀跌。打的好板，次日根本没有溢价就直接开始杀跌，短线情绪走到冰点。有的题材周期，情绪冰点后，还有二冰、三冰
  // 6、混沌
  // 周期定义
  const cycles = ['启动', '发酵', '高潮', '退潮', '冰点', '混沌'];
  // 最大高度 currentTradingDayData.evenBoardData
  const maxHeightCurrent: any = currentTradingDayData?.marketHeight;
  // 昨日高度
  const maxHeightLast: any = lastTradingDayData?.marketHeight;

  // 用赚钱效应、亏钱效应判断 还是 高度？高度资金可以硬怼出来
  // 跌幅大于15的个股
  const hugeFallNum = currentTradingDayData.hugeFallData ? currentTradingDayData.hugeFallData.length : 0;

  if (!lastTradingDayData) {
    return compatible(currentTradingDayData, cycles, maxHeightCurrent, hugeFallNum);
  }

  // A. 主升 【赚钱效应打开】高度增加，无负反馈 大面，情绪转好
  if (maxHeightCurrent >= config.startUpHeight
    && maxHeightCurrent > maxHeightLast
    && hugeFallNum == 0) {
    // 1. 启动 (开始出现4板，连板小于10，不会出现15%以上大面；)
    if (maxHeightCurrent == config.startUpHeight) {
      return cycles[0];
    }
    // 比昨天连板数量多
    if (currentTradingDayData.evenBoardAmount >= lastTradingDayData.evenBoardAmount) {
      // 3. 高潮（前提，不能有连板负反馈）
      if (currentTradingDayData.evenBoardAmount >= config.evenBoardNum
        && currentTradingDayData.dailyLimitQuantity >= config.dailyLimitNum) {
        return cycles[2];
      }
      // 2. 发酵
      return cycles[1];
    }
    // 4. 连板数量不足，甚至降低，退潮
    return cycles[3];
  }

  // B. 主跌 【亏钱效应出现】龙头倒下/高度降低，负反馈出现，天地板、大面，高位持续A杀，接力情绪差
  if (maxHeightCurrent <= maxHeightLast) {
    // 高度下降(退潮、冰点)，且最高板仅4板下
    if (currentTradingDayData.downLimitQuantity > config.downLimitNum
      && hugeFallNum > 0 && currentTradingDayData.maxHeightCurrent <= config.startUpHeight) {
      return cycles[4];
    }
    // 退潮
    return cycles[3];
  }
  // C. 震荡 龙头横盘，等待新周期 或 次高穿越龙
  return cycles[5]
}

function compatible(currentTradingDayData, cycles, maxHeightCurrent, hugeFallNum) {

  // 高度低于5板
  if (maxHeightCurrent <= config.startUpHeight) {
    if (currentTradingDayData.downLimitQuantity > 10) {
      return cycles[4];
    }
    // 今天的最高板没有昨天高，昨天是高潮
    if (maxHeightCurrent === config.startUpHeight && hugeFallNum == 0) {
      return cycles[0];
    }
    return cycles[3];
  }
  // 高潮前提，不能有连板负反馈
  if (currentTradingDayData.evenBoardAmount >= config.evenBoardNum
    && currentTradingDayData.dailyLimitQuantity >= config.dailyLimitNum
    && hugeFallNum == 0) {
    return cycles[2];
  }
  return cycles[1];
}

export const dailyLimitOptionalStrategyStr = '流通市值大于等于20亿，小于等于120亿，主板个股，股价低于30';

/**
 * 涨停自选策略
 * 连板全部加入
 * 策略备注：参考 dailyLimitOptionalStrategyStr
 */
export function dailyLimitOptionalStrategy(stock: any, currentLevel: number | string) {
  // 创业板、科创板 30*、68*、83* 不自选
  if (!isMainPlate(stock.code)) return false;
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


/**
 * 是否 主板个股
 * @param stockCode  个股代码
 * @param increaseDecline  涨跌幅
 */
export function isMainPlate(stockCode: string) {
  if (
    stockCode.startsWith('68') ||
    stockCode.startsWith('30') || stockCode.startsWith('4') ||
    stockCode.startsWith('8')
  ) {
    return false;
  }

  return true;
}

export default { getCurrentCycle, dailyLimitOptionalStrategy, getExpected, isMainPlate };