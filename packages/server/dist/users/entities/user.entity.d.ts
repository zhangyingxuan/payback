import { Timestamp } from "typeorm";
export declare class User {
    id: number;
    name: string;
    account: string;
    password: string;
    isDelete: boolean;
    createTime: Timestamp;
}
