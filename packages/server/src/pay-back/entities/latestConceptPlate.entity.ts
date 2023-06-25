// 最新概念板块
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";
@Entity()
export class latestConceptPlate {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '板块名称', type: 'varchar', length: 30, default: '' })
  name: string;

  @Column({ comment: '板块编码', type: 'varchar', length: 10, default: '' })
  code: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}