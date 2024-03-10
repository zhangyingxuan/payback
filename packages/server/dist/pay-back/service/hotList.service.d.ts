import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { CreateHotListDto } from '../dto/create-hot-list.dto';
export declare class HotListService {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    crawlHotListData(): Promise<{
        code: number;
        data: CreateHotListDto;
    }>;
    findAll(): Promise<any>;
    findByLimit(len?: number): Promise<any>;
}
