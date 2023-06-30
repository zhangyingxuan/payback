// https://xueqiu.com/hq 雪球可以拿到市场点数
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class reviewData {
  @PrimaryGeneratedColumn()
  id: number;

  // 
  @Column({ comment: '短线周期', type: 'varchar', length: 30, default: '' })
  marketScore: number;

  @Column({ comment: '上涨家数', type: 'int', default: 0 })
  riseAmount: number;

  @Column({ comment: '上证点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  shangzhengPoint: number;

  @Column({ comment: '深圳点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  shenzhengPoint: number;

  fallMore5: number;

  @Column({ comment: '上涨幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' })
  hangyeRiseFloat: string;
  @Column({ comment: '下跌幅度最大的行业板块TOP5', type: 'varchar', length: 512, default: '' })
  hangyeFallFloat: string;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}