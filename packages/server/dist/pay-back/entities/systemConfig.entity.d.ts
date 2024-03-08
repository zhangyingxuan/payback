import { Timestamp } from 'typeorm';
export declare class systemConfig {
    id: number;
    isAutoAddSelf: boolean;
    isAutoAddSelfEvenBoard: boolean;
    isAutoAddSelfFirstBoard: boolean;
    baseConfig: string;
    biddingConfig: string;
    isBinddingDelEventBoard: boolean;
    isBinddingDelFirstBoard: boolean;
    createTime: Timestamp;
    updatedTime: Timestamp;
}
