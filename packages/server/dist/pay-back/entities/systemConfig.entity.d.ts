import { Timestamp } from 'typeorm';
export declare class systemConfig {
    id: number;
    isAutoAddSelf: boolean;
    isAutoAddSelfEvenBoard: boolean;
    isAutoAddSelfFirstBoard: boolean;
    baseConfig: string;
    biddingConfig: string;
    createTime: Timestamp;
    updatedTime: Timestamp;
}
