export class CreatePlateDataDto {
  // 涨停家数最多的概念板块
  gainianDailyLimitData: string;
  // 涨停家数最多的概念板块
  gainianDailyLimitNum: number;
  // 涨停最多的行业板块
  hangyeDailyLimitData: string;
  // 涨停最多的行业板块 个数
  hangyeDailyLimitNum: number;

  createTime: Date;
}
