import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '姓名', type: 'varchar', length: 20, default: '' })
  name: string;
  @Column({ comment: '账号', type: 'varchar', length: 20, default: '' })
  account: string;
  @Column({ comment: '密码', type: 'varchar', length: 100, default: '' })
  password: string;
  // 软删除
  @Column({
    default: false
  })

  isDelete: boolean
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}