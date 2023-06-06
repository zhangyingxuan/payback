// 特殊股票
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";
@Entity()
export class specialStock {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '天地板', type: 'varchar' })
  skyFloor: string;

  @Column({ comment: '地天板', type: 'varchar' })
  florSky: string;

  @Column({ comment: '反包板', type: 'varchar' })
  turnUpBoard: string;

  @Column({ comment: '吃面效应/赚钱效应', type: 'varchar' })
  hotEtfs: string;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}