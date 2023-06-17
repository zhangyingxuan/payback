
export class CreatePayBackDto {
  // 涨停数量
  dailyLimitQuantity: number;
  // 跌停数量
  downLimitQuantity: number;
  // 最高连板，市场高度
  marketHeight: number;
  SHAmount: number;
  SZAmount: number;
  evenBoardAmount: number;
  // 连板原始数据
  evenBoardData: string;
  // 跌停数据
  downLimitData: string;
  // 一板数量
  board1: number;
  createTime: Date;
}
