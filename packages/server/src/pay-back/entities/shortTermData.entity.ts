// {
//   '上市交易日天数[20230420]': '6511',
//   'a股市值(不含限售股)[20230420]': '4788658000.000',
//   code: '000404',
//   '股票简称': '长虹华意',
//   '最新价': '6.89',
//   '最新涨跌幅': '10.064',
//   '连续涨停天数[20230420]': 1,
//   market_code: '33',
//   '股票代码': '000404.SZ'
// },
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";

@Entity()
export class shortTermData {
  @PrimaryGeneratedColumn()
  id: number;

  // 涨停数量
  @Column({ comment: '涨停数量', type: 'int', default: 0 })
  dailyLimitQuantity: number;

  @Column({ comment: '涨停封板率', type: 'int', default: 0 })
  sealingRate: number;

  // 跌停数量
  @Column({ comment: '跌停数量', type: 'int', default: 0 })
  downLimitQuantity: number;
  // 最高连板，市场高度
  @Column({ comment: '最高连板，市场高度', type: 'int', default: 0 })
  marketHeight: number;

  @Column({ comment: '深圳涨停数量', type: 'int', default: 0 })
  SZAmount: number;

  @Column({ comment: '上海涨停数量', type: 'int', default: 0 })
  SHAmount: number;

  @Column({ comment: '连板数量', type: 'int', default: 0 })
  evenBoardAmount: number;

  @Column({ comment: '连板原始数据', type: 'text' })
  evenBoardData: string;
  // 一板数量
  @Column({ comment: '1板数量', type: 'int', default: 0 })
  board1: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}