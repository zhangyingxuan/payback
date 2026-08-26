import { Timestamp } from 'typeorm';
export declare class plateData {
    id: number;
    tradeDate: string;
    gainianDailyLimitNum: number;
    gainianDailyLimitData: string;
    hangyeDailyLimitNum: number;
    hangyeDailyLimitData: string;
    createTime: Timestamp;
}
