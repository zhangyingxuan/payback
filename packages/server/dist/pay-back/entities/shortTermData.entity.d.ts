import { Timestamp } from "typeorm";
export declare class shortTermData {
    id: number;
    dailyLimitQuantity: number;
    dailyLimitOpenQuantity: number;
    dailyLimitReturnSealQuantity: number;
    sealingRate: number;
    downLimitQuantity: number;
    marketHeight: number;
    evenBoardAmount: number;
    evenBoardData: string;
    biddingData: string;
    downLimitData: string;
    hugeFallData: string;
    board1: number;
    cycle: string;
    createTime: Timestamp;
}
