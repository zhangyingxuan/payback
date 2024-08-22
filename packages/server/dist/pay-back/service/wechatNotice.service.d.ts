import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
export declare class wechatNotice {
    private readonly hotListRp;
    constructor(hotListRp: Repository<hotList>);
    private readonly logger;
    notice(): Promise<void>;
}
