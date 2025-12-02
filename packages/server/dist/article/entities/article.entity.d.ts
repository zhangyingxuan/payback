import { Timestamp } from 'typeorm';
export declare class Article {
    id: number;
    title: string;
    content: string;
    createTime: Timestamp;
    updatedTime: Timestamp;
}
