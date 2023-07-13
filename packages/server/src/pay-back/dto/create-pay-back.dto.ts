
export class CreatePayBackDto {
  // 涨停数量
  dailyLimitQuantity: number;
  // 涨停打开数量
  dailyLimitOpenQuantity: number;
  // 封板率
  sealingRate: number;
  // 涨停回封数量
  dailyLimitReturnSealQuantity: number;
  // 跌停数量
  downLimitQuantity: number;
  // 最高连板，市场高度
  marketHeight: number;
  evenBoardAmount: number;
  // 连板原始数据
  evenBoardData: string;
  // 跌停数据
  downLimitData: string;
  // 一板数量
  board1: number;
  cycle: string;
  createTime: Date;
}
