import { Timestamp } from 'typeorm';
export declare class shortTermData {
    id: number;
    dailyLimitQuantity: number;
    dailyLimitOpenQuantity: number;
    dailyLimitReturnSealQuantity: number;
    downLimitQuantity: number;
    hugeFallQuantity: number;
    sealingRate: number;
    marketHeight: number;
    evenBoardAmount: number;
    evenBoardData: string;
    downLimitData: string;
    hugeFallData: string;
    cycle: string;
    createTime: Timestamp;
}
