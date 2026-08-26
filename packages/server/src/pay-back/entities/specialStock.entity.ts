// 特殊股票
import { PrimaryGeneratedColumn, Column, Entity, Timestamp, Index } from 'typeorm';
@Entity()
@Index('IDX_special_stock_trade_date', ['tradeDate'], { unique: true })
export class specialStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true, comment: '交易日期' })
  tradeDate: string;

  @Column({ comment: '昨日涨停今日集合竞价情况', type: 'mediumtext', nullable: true })
  biddingData: string;

  @Column({ comment: '新股数据', type: 'varchar', length: 1024, nullable: true })
  newStock: string;

  @Column({ comment: '策略选股', type: 'varchar', length: 4096, nullable: true })
  chooseStock: string;

  @Column({ comment: '主力净流入TOP3个股', type: 'varchar', nullable: true })
  fundsLikeStock: string;

  @Column({ comment: '近1个月涨幅最高的个股Top3', type: 'varchar', nullable: true })
  heightestStock: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;

  @Column({ type: 'timestamp', comment: '更新时间', default: () => 'current_timestamp' })
  updatedTime: Timestamp;
}
