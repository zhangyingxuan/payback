import { Timestamp } from "typeorm";
export declare class hotList {
    id: number;
    hotStocks: number;
    hotPlates: number;
    hotEtfs: number;
    createTime: Timestamp;
}
