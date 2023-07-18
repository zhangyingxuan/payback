import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
export declare class HotListService {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    crawlHotListData(): Promise<{
        code: number;
        data: {
            createTime: string;
            stockNormal: string;
            stockValue: string;
            plateConcept: string;
            plateIndustry: string;
            updatedTime: Date;
        };
    }>;
    findAll(): Promise<hotList[]>;
    findByLimit(len?: number): Promise<hotList[]>;
}
