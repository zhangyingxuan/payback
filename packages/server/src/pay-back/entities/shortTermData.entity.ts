import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class shortTermData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '涨停数量', type: 'tinyint', default: 0 })
  dailyLimitQuantity: number;

  @Column({ comment: '涨停打开数量', type: 'tinyint', default: 0 })
  dailyLimitOpenQuantity: number;

  @Column({ comment: '涨停回封数量', type: 'tinyint', default: 0 })
  dailyLimitReturnSealQuantity: number;

  @Column({ comment: '涨停封板率', type: 'tinyint', default: 0 })
  sealingRate: number;

  @Column({ comment: '跌停数量', type: 'tinyint', default: 0 })
  downLimitQuantity: number;

  @Column({ comment: '最高连板，市场高度', type: 'tinyint', default: 0 })
  marketHeight: number;

  @Column({ comment: '连板数量', type: 'tinyint', default: 0 })
  evenBoardAmount: number;

  @Column({ comment: '连板原始数据', type: 'text', nullable: true })
  evenBoardData: string;

  @Column({ comment: '跌停数据', type: 'varchar', length: 6096, default: '' })
  downLimitData: string;

  @Column({ comment: '跌幅大于等于15的个股', type: 'varchar', length: 2048, default: '' })
  hugeFallData: string;

  // TODO 目前不够完善
  @Column({ comment: '短线周期', type: 'varchar', length: 30, default: '' })
  cycle: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}