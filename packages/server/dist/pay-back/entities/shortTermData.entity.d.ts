import { Timestamp } from "typeorm";
export declare class shortTermData {
    id: number;
    dailyLimitQuantity: number;
    sealingRate: number;
    downLimitQuantity: number;
    marketHeight: number;
    SZAmount: number;
    SHAmount: number;
    evenBoardAmount: number;
    evenBoardData: string;
    downLimitData: string;
    board1: number;
    createTime: Timestamp;
}
