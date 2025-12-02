import { Timestamp } from 'typeorm';
export declare class User {
    id: number;
    name: string;
    account: string;
    password: string;
    user: string;
    ticket: string;
    userid: string;
    isAdmin: boolean;
    isDelete: boolean;
    createTime: Timestamp;
}
