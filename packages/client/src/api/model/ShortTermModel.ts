export interface ShortTermModel {
  // 涨停数量
  dailyLimitQuantity: number;

  // 跌停数量
  downLimitQuantity: number;
  // 涨停封板率
  sealingRate: number;
  // 涨停回封数量
  dailyLimitReturnSealQuantity: number;
  // 最高连板，市场高度
  marketHeight: number;
  // 一字板数量
  yizi: number;
  evenBoardAmount: number,
  evenBoardData: string;
  // 新股数据
  newStock: string;
  // 选股数据
  chooseStock: string;
  // 跌停数据
  downLimitData: string;
  // 大面
  hugeFallData: string;
  // 短线周期
  cycle: string;
  createTime: Date;
}
