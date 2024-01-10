// 新股数据
// 股价，流通，竞价涨幅，收盘涨幅；公开发行市值
export class NewStockDto {
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
  // 集合竞价评级
  bidRating: string;
  // 竞价异动类型：抢筹，砸盘，试盘，大幅高开等
  bidChangeTypeT: string;
  // 竞价涨幅
  bidIncreaseT: number;
  // 收盘涨幅
  closeIncrease: number;
}
