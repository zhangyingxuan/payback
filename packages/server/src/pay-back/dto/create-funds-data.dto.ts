export class CreateFundsDataDto {
  northFundsAmtIn: number;

  northFundsBuyAmt: number;

  southFundsAmtIn: number;

  southFundsBuyAmt: number;
  // 行业板块主力资金Top
  hangyeFundsTop: string;
  // 概念板块主力资金Top
  gainianFundsTop: string;
  // 两市，成交额
  marketTurnover: number;

  createTime: Date;
}
