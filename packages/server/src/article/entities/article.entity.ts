import { PrimaryGeneratedColumn, Column, Entity, Timestamp, UpdateDateColumn } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '标题', type: 'varchar', length: 200, default: '' })
  title: string;

  @Column({ comment: '文章内容', type: 'text' })
  content: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedTime: Timestamp;
}
