// 资金数据
import { PrimaryGeneratedColumn, Column, Entity, Timestamp } from "typeorm";
// 东方财富，历史资金流向 https://data.eastmoney.com/zjlx/dpzjlx.html
// 北向资金流向 https://data.eastmoney.com/hsgt/index.html
// https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112305225326403222086_1682431296037&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE
// 沪深资金流向 https://data.eastmoney.com/zjlx/dpzjlx.html
// https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery1123016070160827100222_1682431790072&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1682431790073
@Entity()
export class fundsData {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ comment: '北向资金（聪明资金）净流入', type: 'float', default: 0 })
  northFundsAmtIn: number;
  @Column({ comment: '北向资金（聪明资金）净买入', type: 'float', default: 0 })
  northFundsBuyAmt: number;

  @Column({ comment: '南向资金（到港资金）净流入', type: 'float', default: 0 })
  southFundsAmtIn: number;
  @Column({ comment: '南向资金（到港资金）净买入', type: 'float', default: 0 })
  southFundsBuyAmt: number;

  @Column({ comment: '行业板块主力资金Top', type: 'text', nullable: true })
  hangyeFundsTop: string;
  @Column({ comment: '概念板块主力资金Top', type: 'text', nullable: true })
  gainianFundsTop: string;

  @Column({ comment: '市场成交总额', type: 'float', default: 0 })
  marketTurnover: number;

  // @Column({ type: 'date', comment: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', default: () => 'current_timestamp' })
  createTime: Timestamp;
}