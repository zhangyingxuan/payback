import { Timestamp } from "typeorm";
export declare class User {
    id: number;
    name: string;
    account: string;
    password: string;
    user: string;
    ticket: string;
    userid: string;
    isDelete: boolean;
    createTime: Timestamp;
}
