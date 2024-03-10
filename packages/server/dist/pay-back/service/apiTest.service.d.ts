import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
export declare class ApiTestService {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    fetchHotList(): Promise<void>;
    getThsSelfStocks(): Promise<void>;
    datacenterWeb(): Promise<void>;
    otherTest(): Promise<void>;
    findAll(): Promise<any>;
    findByLimit(len?: number): Promise<any>;
}
