// 强势股：价格、流通、板块、昨日换手、筹码集中度
export class StrongStockDto {
  // 名称
  name: string;
  // 代码
  code: string;
  // 股价
  price: number;
  // 流通市值
  circulationValue: number;
  // 所属同花顺二级行业
  plateLevel2: string;
  // 筹码集中度
  cmjzd: number;
  // 收盘获利 比例
  sphl: number;
  // 换手率
  turnoverRate: number;
  // 集合竞价评级
  bidRating: string;
  // 竞价异动类型：抢筹，砸盘，试盘，大幅高开等
  bidChangeTypeT: string;
  // 竞价涨幅
  bidIncreaseT: number;
  // 收盘涨幅
  closeIncrease: number;
}