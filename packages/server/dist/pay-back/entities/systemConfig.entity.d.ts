import { Timestamp } from 'typeorm';
export declare class systemConfig {
    id: number;
    isAutoAddSelfStock: boolean;
    baseConfig: string;
    biddingConfig: string;
    createTime: Timestamp;
    updatedTime: Timestamp;
}
