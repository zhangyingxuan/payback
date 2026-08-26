import { Timestamp } from 'typeorm';
export declare class marketData {
    id: number;
    tradeDate: string;
    marketScore: number;
    riseAmount: number;
    fallAmount: number;
    dailyLimitIncome: number;
    marketTurnover: number;
    shangzhengRiseAndFall: number;
    shangzhengPoint: number;
    shenzhengPoint: number;
    chuangyePoint: number;
    beizheng50Point: number;
    riseMore5: number;
    fallMore5: number;
    gainianRiseFloat: string;
    gainianFallFloat: string;
    hangyeRiseFloat: string;
    hangyeFallFloat: string;
    createTime: Timestamp;
}
