import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from 'typeorm';

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

  // （指数强度、涨跌比）成交量、3日涨跌
  @Column({ comment: '市场情绪', type: 'varchar', length: 30, default: '' })
  marketMood: string;

  // （涨停数量、连板数量、连板高度、炸板率）
  @Column({ comment: '投机情绪', type: 'varchar', length: 30, default: '' })
  toujiMood: string;

  // 资金偏好，有高度，主升，有强度，人气高，容易集体爆发，容易发酵等等需要具体分析，有位差，有走强点，指数强度
  @Column({ comment: '板块情绪', type: 'varchar', length: 30, default: '' })
  plateMood: string;

  // 综合的赚钱效应、最近的市场情绪、投机情绪、主流板块情绪、论坛氛围、消息面影响等等。突破阳线大幅强化
  @Column({ comment: '近期市场情绪', type: 'varchar', length: 30, default: '' })
  overallMarketMood: string;

  // 最近阶段的投机氛围。出现高位妖股、大批量强势股大幅强化、涨停板溢价越来越高强化、炸板的负溢价越来越高弱化
  @Column({ comment: '近期投机情绪', type: 'varchar', length: 30, default: '' })
  overallToujiMood: string;

  // 龙头拉开空间，不是一日游题材，人气高，始终活跃
  @Column({ comment: '近期板块情绪', type: 'varchar', length: 30, default: '' })
  overallPlateMood: string;

  @Column({ comment: '赚钱效应', type: 'varchar', length: 30, default: '' })
  moneyMakingEffect: string;

  @Column({ comment: '亏钱效应', type: 'varchar', length: 30, default: '' })
  moneyLossEffect: string;

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
