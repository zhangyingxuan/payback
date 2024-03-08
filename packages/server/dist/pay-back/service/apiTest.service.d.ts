import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
export declare class ApiTestService {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    fetchExternalData(): Promise<void>;
    fetchHotList(): Promise<void>;
    getThsSelfStocks(): Promise<void>;
    datacenterWeb(): Promise<void>;
    otherTest(): Promise<void>;
    findAll(): Promise<hotList[]>;
    findByLimit(len?: number): Promise<hotList[]>;
}
