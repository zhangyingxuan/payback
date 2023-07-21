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
  @Column({ comment: 'user', type: 'varchar', length: 520, default: '' })
  user: string;
  @Column({ comment: 'ticket', type: 'varchar', length: 256, default: '' })
  ticket: string;
  @Column({ comment: 'userid', type: 'varchar', length: 256, default: '' })
  userid: string;
  // 软删除
  @Column({
    default: false
  })

  isDelete: boolean
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}