import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { CreateHotListDto } from '../dto/create-hot-list.dto';
export declare class HotListService {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    crawlHotListData(): Promise<CreateHotListDto>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
    findAll(): Promise<hotList[]>;
    findByLimit(len?: number): Promise<hotList[]>;
}
