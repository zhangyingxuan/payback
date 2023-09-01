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

export const dailyLimitOptionalStrategyStr = '流通市值大于等于30亿，小于等于120亿，涨停10cm的个股，股价低于30';

/**
 * 涨停自选策略
 * 连板全部加入
 * 策略备注：参考 dailyLimitOptionalStrategyStr
 */
export function dailyLimitOptionalStrategy(stock: any, currentLevel: number | string) {
  // 创业板、科创板不自选
  if (stock.type != 0) return false;
  // 连板全部加入
  if (currentLevel != 1) return true;
  return stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}

export default { getCurrentCycle, dailyLimitOptionalStrategy };