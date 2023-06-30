import { Timestamp } from "typeorm";
export declare class reviewData {
    id: number;
    marketScore: number;
    riseAmount: number;
    shangzhengPoint: number;
    shenzhengPoint: number;
    fallMore5: number;
    hangyeRiseFloat: string;
    hangyeFallFloat: string;
    createTime: Timestamp;
}
