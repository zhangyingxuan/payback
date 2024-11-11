export class DailyLimitStockDto {
  // 名称
  name: string;
  // 代码
  code: string;
  // 所属同花顺二级行业
  plateLevel2: string;
  // 换手率
  turnoverRate: number;
  // 涨停原因
  reason: string;
  // 涨停概念
  gainian: string;
  // 成交额，
  turnover: number;
  // 成交量类型，一字涨停
  turnoverType: string;
  // 封板资金
  closingFunds: number;
  // 封板量比 - 封单量/总成交量 * 100
  // closingRatio: number;
  // 几天几板
  evenDays: string;
  // 股价
  price: number;
  // 流通市值
  circulationValue: number;
  // 开板次数
  openTimes: number;
  // 涨停时间（首次，最终）
  dailyTime: string;
}
