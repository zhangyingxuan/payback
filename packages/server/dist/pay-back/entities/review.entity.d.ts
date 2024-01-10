import { Timestamp } from 'typeorm';
export declare class reviewData {
    id: number;
    cycle: string;
    dateCycle: string;
    marketScore: number;
    marketMood: string;
    toujiMood: string;
    plateMood: string;
    overallMarketMood: string;
    overallToujiMood: string;
    overallPlateMood: string;
    moneyMakingEffect: string;
    moneyLossEffect: string;
    totalLeader: string;
    plateLeader: string;
    strongestPlate: string;
    strongestTopic: string;
    hotStocks: string;
    fundsLikeStocks: string;
    createTime: Timestamp;
}
