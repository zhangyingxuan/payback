// 昨日涨停个股，9.25集合竞价情况
export class DailyLimitYesterdayBiddingDto {
  // 名称
  name: string;
  // 代码
  code: string;
  // 所属同花顺二级行业
  plateLevel2: string;
  // 竞价异动类型：抢筹，砸盘，试盘，大幅高开等
  bidChangeTypeT: string;
  // 竞价涨幅
  bidIncreaseT: number;
  // 竞价量比
  bidVolumeRatio: number;
  // 集合竞价评级
  bidRating: string;
  // 收盘涨幅
  closeIncrease: number;
  // 开板次数
  openTimes: number;
  // 涨停时间
  dailyTime: string;
  // 几天几板
  evenDays: string;
  // 预期涨幅
  // 预期值：不符合预期0;符合预期1;超预期2
  expected: number;
}
