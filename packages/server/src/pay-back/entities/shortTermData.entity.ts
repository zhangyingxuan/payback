import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class shortTermData {
  @PrimaryGeneratedColumn()
  id: number;

  // 涨停数量
  @Column({ comment: '涨停数量', type: 'int', default: 0 })
  dailyLimitQuantity: number;

  @Column({ comment: '涨停封板率', type: 'int', default: 0 })
  sealingRate: number;

  @Column({ comment: '跌停数量', type: 'int', default: 0 })
  downLimitQuantity: number;

  @Column({ comment: '最高连板，市场高度', type: 'int', default: 0 })
  marketHeight: number;

  @Column({ comment: '深圳涨停数量', type: 'int', default: 0 })
  SZAmount: number;

  @Column({ comment: '上海涨停数量', type: 'int', default: 0 })
  SHAmount: number;

  @Column({ comment: '连板数量', type: 'int', default: 0 })
  evenBoardAmount: number;

  @Column({ comment: '连板原始数据', type: 'text' })
  evenBoardData: string;

  @Column({ comment: '跌停数据', type: 'varchar', length: 3072, default: '' })
  downLimitData: string;

  @Column({ comment: '1板数量', type: 'int', default: 0 })
  board1: number;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}