import { PrimaryGeneratedColumn, Column, Entity, Timestamp, Index } from 'typeorm';

@Entity()
@Index('IDX_plate_trade_date', ['tradeDate'], { unique: true })
export class plateData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true, comment: '交易日期' })
  tradeDate: string;

  @Column({ comment: '涨停家数最多的概念板块个数', type: 'float', default: 0 })
  gainianDailyLimitNum: number;

  @Column({ comment: '涨停家数最多的概念板块', type: 'varchar', length: 512, default: '' })
  gainianDailyLimitData: string;

  @Column({ comment: '涨停家数最多的概念板块个数', type: 'float', default: 0 })
  hangyeDailyLimitNum: number;

  @Column({ comment: '涨停家数最多的概念板块', type: 'varchar', length: 512, default: '' })
  hangyeDailyLimitData: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}
