import { Timestamp } from "typeorm";
export declare class reviewData {
    id: number;
    cycle: string;
    dateCycle: string;
    marketScore: number;
    marketMood: string;
    dailyLimitQuantity: number;
    downLimitQuantity: number;
    totalLeader: string;
    plateLeader: string;
    strongestPlate: string;
    strongestTopic: string;
    hotStocks: string;
    fundsLikeStocks: string;
    createTime: Timestamp;
}
