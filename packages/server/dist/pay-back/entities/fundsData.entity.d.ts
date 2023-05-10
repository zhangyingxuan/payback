import { Timestamp } from "typeorm";
export declare class fundsData {
    id: number;
    northFundsAmtIn: number;
    northFundsBuyAmt: number;
    southFundsAmtIn: number;
    southFundsBuyAmt: number;
    marketTurnover: number;
    createTime: Timestamp;
}
