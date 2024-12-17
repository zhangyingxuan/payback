export class CreateMarketDataDto {
  marketPoint: number;

  marketScore: number;
  riseAmount: number;
  fallAmount: number;
  northFunds: number;
  dailyLimitIncome: number;

  shangzhengRiseAndFall: number;

  shangzhengPoint: number;

  shenzhengPoint: number;

  chuangyePoint: number;

  beizheng50Point: number;

  gainianRiseFloat: string;
  gainianFallFloat: string;
  hangyeRiseFloat: string;
  hangyeFallFloat: string;
  // 成交量
  marketTurnover: number;

  riseMore5: number;

  fallMore5: number;
  createTime: Date;
}
