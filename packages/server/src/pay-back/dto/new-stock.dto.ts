// 新股数据
export class NewStockDto {
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
  // 收盘涨幅
  closeIncrease: number;
}