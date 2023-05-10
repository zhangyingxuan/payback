import { Timestamp } from "typeorm";
export declare class marketData {
    id: number;
    marketScore: number;
    riseAmount: number;
    fallAmount: number;
    dailyLimitIncome: number;
    shangzhengPoint: number;
    shangzhengFloat: number;
    shenzhengPoint: number;
    shenzhengFloat: number;
    chuangyePoint: number;
    chuangyeFloat: number;
    beizheng50Point: number;
    beizheng50Float: number;
    riseMore5: number;
    fallMore5: number;
    createTime: Timestamp;
}
