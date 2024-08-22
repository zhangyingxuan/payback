import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { QyWechatNotice } from './qyWechatNotice.service';
export declare class ApiTestService {
    private readonly hotListRp;
    private readonly qyWechatNotice;
    constructor(hotListRp: Repository<hotList>, qyWechatNotice: QyWechatNotice);
    private readonly logger;
    notice(): Promise<any>;
    fetchHotList(): Promise<void>;
    getThsSelfStocks(): Promise<void>;
    datacenterWeb(): Promise<void>;
    otherTest(): Promise<void>;
    findAll(): Promise<hotList[]>;
    findByLimit(len?: number): Promise<hotList[]>;
}
