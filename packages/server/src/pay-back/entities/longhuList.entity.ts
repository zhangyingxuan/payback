// 龙虎榜 https://data.10jqka.com.cn/mobile/transaction/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/
// 接口 按净买入降序排序，选出前三；最后三个 https://data.10jqka.com.cn/dataapi/transaction/stock/v1/list?order_field=net_value&order_type=desc&date=2023-05-29&filter=&page=1&size=50&module=all&order_null_greater=0
// 游资榜 https://data.10jqka.com.cn/dataapi/transaction/stock/v1/list?order_field=hot_money_net_value&order_type=desc&date=2023-05-29&filter=&page=1&size=50&module=hot_money&order_null_greater=0
// 机构榜、游资榜 成交金额
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";
@Entity()
export class longhuList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '总榜成交', type: 'decimal', default: 0, precision: 8, scale: 2 })
  totalAmount: number;

  @Column({ comment: '总榜净买', type: 'decimal', default: 0, precision: 8, scale: 2 })
  totalBuyAmount: number;

  @Column({ comment: '机构成交', type: 'decimal', default: 0, precision: 8, scale: 2 })
  organizationAmount: number;

  @Column({ comment: '机构净买', type: 'decimal', default: 0, precision: 8, scale: 2 })
  organizationBuyAmount: number;

  @Column({ comment: '游资成交', type: 'decimal', default: 0, precision: 8, scale: 2 })
  hotMoneyAmount: number;

  @Column({ comment: '游资净买', type: 'decimal', default: 0, precision: 8, scale: 2 })
  hotMoneyBuyAmount: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}