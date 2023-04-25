export interface MarketModel {
  marketPoint: number;

  marketScore: number;
  riseAmount: number;
  fallAmount: number;
  northFunds: number;
  dailyLimitIncome: number;
  riseMore5: number;
  fallMore5: number;

  createTime: Date;
}