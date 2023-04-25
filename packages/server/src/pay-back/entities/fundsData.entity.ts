// 资金数据
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class marketData {
  @PrimaryGeneratedColumn()
  id: number;
  // 北向资金
  @Column({ comment: '北向资金净流入', type: 'float', default: 0 })
  marketPoint: number;

  @Column({ comment: '北向资金净流出', type: 'float', default: 0 })
  marketScore: number;

  // 龙虎榜
  @Column({ comment: '上涨家数', type: 'int', default: 0 })
  riseAmount: number;

  @Column({ comment: '下跌家数', type: 'int', default: 0 })
  fallAmount: number;

  // 市场量能
  @Column({ comment: '市场总成交额', type: 'float', default: 0 })
  northFunds: number;

  @Column({ comment: '昨日涨停今日收益', type: 'float', default: 0 })
  dailyLimitIncome: number;

  @Column({ comment: '上涨>=5%家数', type: 'int', default: 0 })
  riseMore5: number;

  // 跌停数量
  @Column({ comment: '下跌>=5%家数', type: 'int', default: 0 })
  fallMore5: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}