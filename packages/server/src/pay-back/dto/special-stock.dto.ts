// 特殊个股
export class SpecialStockDto {
  // 昨日涨停今日集合竞价情况
  biddingData: string;
  // 新股数据
  newStock: string;
  // 策略选股
  chooseStock: string;
  // 主力净流入TOP3个股
  fundsLikeStock: string;
  // 近1个月涨幅最高的个股Top3
  heightestStock: string;
  // 创建时间
  createTime: Date;
  // 更新时间
  updatedTime: Date;
}
