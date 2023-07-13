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

  // 短线中的 高标 其实就是反包板
  @Column({ comment: '反包板', type: 'varchar' })
  turnUpBoard: string;

  @Column({ comment: '主力净流入TOP3个股', type: 'varchar' })
  fundsLikeStock: string;

  @Column({ comment: '近1个月涨幅追高的个股Top3', type: 'varchar' })
  heightestStock: string;

  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}