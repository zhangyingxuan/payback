import { Timestamp } from 'typeorm';
export declare class fundsData {
    id: number;
    tradeDate: string;
    northFundsAmtIn: number;
    northFundsBuyAmt: number;
    southFundsAmtIn: number;
    southFundsBuyAmt: number;
    hangyeFundsTop: string;
    gainianFundsTop: string;
    marketTurnover: number;
    createTime: Timestamp;
}
