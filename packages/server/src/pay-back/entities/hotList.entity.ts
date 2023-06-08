// 同花顺热榜 https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/
// 大家都在看、价值投资派、趋势投资派

import { PrimaryGeneratedColumn, Column, Entity, Timestamp, CreateDateColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class hotList {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '热门个股大家都在看Top10', type: 'varchar', length: 2048, default: '' })
  stockNormal: string;

  @Column({ comment: '热门个股价值投资Top10', type: 'varchar', length: 2048, default: '' })
  stockValue: string;

  @Column({ comment: '热门概念板块Top5', type: 'varchar', length: 2048, default: '' })
  plateConcept: string;

  @Column({ comment: '热门行业板块Top5', type: 'varchar', length: 2048, default: '' })
  plateIndustry: string;

  @Column({ comment: '热门Etf Top5', type: 'varchar', length: 2048, default: '' })
  hotEtfs: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createTime: Timestamp;

  @UpdateDateColumn({ type: "timestamp", comment: '更新时间' })
  updatedTime: Timestamp;
}

const test = {
  name: '',
  code: '',
  hotTag: '',
  tag: '',
  rise_and_fall: '',
}