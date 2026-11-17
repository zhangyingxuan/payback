export interface MarketModel {
  marketPoint: number;

  marketScore: number;
  riseAmount: number;
  fallAmount: number;
  northFunds: number;
  dailyLimitIncome: number;

  shangzhengRiseAndFall: number;

  shangzhengPoint: number;

  shenzhengPoint: number;
  // 实时市场接口补充涨跌幅；历史记录可能没有这两个字段。
  shenzhengRiseAndFall?: number | null;

  chuangyePoint: number;
  chuangyeRiseAndFall?: number | null;

  beizheng50Point: number;

  riseMore5: number;
  marketTurnover: number;
  fallMore5: number;

  createTime: Date;
}
