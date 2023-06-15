
export class DownLimitStockDto {
  // 名称
  name: string;
  // 代码
  code: string;
  // 所属同花顺二级行业
  plateLevel2: string;
  // 成交额，
  turnover: number;
  // 封板资金
  closingFunds: number;
  // 几天几板
  evenDays: string;
}