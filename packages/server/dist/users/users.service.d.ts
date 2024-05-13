import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Cache } from 'cache-manager';
export declare class UsersService {
    private readonly userRp;
    private cacheManager;
    constructor(userRp: Repository<User>, cacheManager: Cache);
    private readonly logger;
    findOne(user: any): Promise<any | undefined>;
    getUserByAccount(account: string): Promise<any | undefined>;
    clearUserInfoCache(account: string): Promise<any | undefined>;
    updateUserInfo(account: string, token: any, user: any): Promise<any | undefined>;
}
