import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Cache } from 'cache-manager';
export declare class UsersService {
    private readonly userRp;
    private cacheManager;
    constructor(userRp: Repository<User>, cacheManager: Cache);
    private readonly logger;
    findOne(user: any): Promise<any | undefined>;
    getUserByAccount(user: any): Promise<any | undefined>;
    clearUserInfoCache(): Promise<any | undefined>;
}
