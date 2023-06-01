// 同花顺热榜 https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/
// 大家都在看、价值投资派、趋势投资派
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";
@Entity()
export class hotList {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '热门个股Top10', type: 'text' })
  hotStocks: number;

  @Column({ comment: '热门板块Top10', type: 'text' })
  hotPlates: number;

  @Column({ comment: '热门Etf top10', type: 'text' })
  hotEtfs: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}