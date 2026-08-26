export class CreatePayBackDto {
  tradeDate: string;
  // 涨停数量
  dailyLimitQuantity: number;
  // 涨停打开数量
  dailyLimitOpenQuantity: number;
  // 跌幅大于等于15的个股数量
  hugeFallQuantity: number;
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
  // 选股数据
  chooseStock: string;
  // 跌停数据
  downLimitData: string;
  // 跌幅大于等于15的个股
  hugeFallData: string;
  cycle: string;
  createTime: Date;
}
