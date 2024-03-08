// 系统配置 配置自动添加自选
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from 'typeorm';
@Entity()
export class systemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '每日收盘是否自动添加自选个股 0不添加 1添加', type: 'tinyint', width: 1, default: 0 })
  isAutoAddSelf: boolean;

  @Column({ comment: '自选连板 0不添加 1添加', type: 'tinyint', width: 1, default: 0 })
  isAutoAddSelfEvenBoard: boolean;

  @Column({ comment: '自选首板 0不添加 1添加', type: 'tinyint', width: 1, default: 0 })
  isAutoAddSelfFirstBoard: boolean;

  @Column({ comment: '基础配置', type: 'varchar', length: 512, nullable: true })
  baseConfig: string;

  @Column({ comment: '竞价相关配置', type: 'varchar', length: 512, nullable: true })
  biddingConfig: string;

  @Column({ comment: '是否竞价删除 连板', type: 'tinyint', width: 1, default: 0 })
  isBinddingDelEventBoard: boolean;

  @Column({ comment: '是否竞价删除 首板', type: 'tinyint', width: 1, default: 0 })
  isBinddingDelFirstBoard: boolean;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;

  @Column({ type: 'timestamp', comment: '更新时间', default: () => 'current_timestamp' })
  updatedTime: Timestamp;
}
