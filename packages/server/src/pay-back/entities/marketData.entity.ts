// https://xueqiu.com/hq 雪球可以拿到市场点数
import { PrimaryGeneratedColumn, Column, Entity, Timestamp, Decimal128 } from "typeorm";

@Entity()
export class marketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '大盘评级', type: 'float', default: 0 })
  marketScore: number;

  @Column({ comment: '上涨家数', type: 'int', default: 0 })
  riseAmount: number;

  @Column({ comment: '下跌家数', type: 'int', default: 0 })
  fallAmount: number;

  @Column({ comment: '昨日涨停今日收益', type: 'float', default: 0 })
  dailyLimitIncome: number;

  // // TODO 市场成交额
  // @Column({ comment: '市场成交总额', type: 'float', default: 0 })
  // marketTurnover: number;

  @Column({ comment: '上证点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  shangzhengPoint: number;

  @Column({ comment: '深圳点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  shenzhengPoint: number;

  @Column({ comment: '创业板点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  chuangyePoint: number;

  @Column({ comment: '北证50点数', type: 'decimal', default: 0, precision: 8, scale: 2 })
  beizheng50Point: number;

  @Column({ comment: '上涨>=5%家数', type: 'int', default: 0 })
  riseMore5: number;

  @Column({ comment: '下跌>=5%家数', type: 'int', default: 0 })
  fallMore5: number;

  @Column({ comment: '上涨幅度最大的板块TOP5', type: 'varchar', length: 512, default: '' })
  risePlateTop5: number;

  @Column({ comment: '下跌幅度最大的板块TOP5', type: 'varchar', length: 512, default: '' })
  fallPlateTop5: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}