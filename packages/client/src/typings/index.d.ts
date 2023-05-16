// 涨停股票基本信息
export interface DailyLimitStockDto {
  // 名称
  name: string;
  // 代码
  code: string;
  // 涨停原因
  reason: string;
  // 成交额，
  turnover: number;
  // 封板资金
  closingFunds: number;
}