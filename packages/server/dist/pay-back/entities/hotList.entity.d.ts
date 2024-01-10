import { Timestamp } from 'typeorm';
export declare class hotList {
    id: number;
    stockNormal: string;
    stockValue: string;
    plateConcept: string;
    plateIndustry: string;
    hotEtfs: string;
    createTime: Timestamp;
    updatedTime: Timestamp;
}
