
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
  // 成交额，
  turnover: number;
  // 成交量类型，一字涨停
  turnoverType: string;
  // 封板资金
  closingFunds: number;
  // 几天几板
  evenDays: string;

  // 新增字段 2023-06-21 20:02:23
  // 10cm  20cm 其他 - 0,1,2
  type: number;
  // 股价
  price: number;
  // 流通市值
  circulationValue: number;
  // 开板次数
  openTimes: number;
  // 涨停时间（首次，最终）
  dailyTime: string;
}