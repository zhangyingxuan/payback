import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class reviewData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '短线周期', type: 'varchar', length: 30, default: '' })
  cycle: string;

  @Column({ comment: '时间周期', type: 'varchar', length: 30, default: '' })
  dateCycle: string;

  @Column({ comment: '市场评分', type: 'float', default: 0 })
  marketScore: number;

  @Column({ comment: '大盘情绪', type: 'varchar', length: 30, default: '' })
  marketMood: string;

  @Column({ comment: '赚钱效应', type: 'varchar', length: 30, default: '' })
  moneyMakingEffect: string;

  @Column({ comment: '亏钱效应', type: 'varchar', length: 30, default: '' })
  moneyLossEffect: string;

  @Column({ comment: '涨停数量', type: 'int', default: 0 })
  dailyLimitQuantity: number;

  @Column({ comment: '短线跌停', type: 'int', default: 0 })
  downLimitQuantity: number;

  @Column({ comment: '总龙头', type: 'varchar', length: 30, default: '' })
  totalLeader: string;

  @Column({ comment: '板块龙头', type: 'varchar', length: 30, default: '' })
  plateLeader: string;

  @Column({ comment: '最强板块', type: 'varchar', length: 30, default: '' })
  strongestPlate: string;

  @Column({ comment: '最强题材', type: 'varchar', length: 30, default: '' })
  strongestTopic: string;

  @Column({ comment: '人气股（热榜TOP10除涨停外个股）', type: 'varchar', length: 512, default: '' })
  hotStocks: string;

  @Column({ comment: '资金青睐个股(资金净流入top3 + 板块)', type: 'varchar', length: 512, default: '' })
  fundsLikeStocks: string;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}