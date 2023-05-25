import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly userRp;
    constructor(userRp: Repository<User>);
    findOne(user: any): Promise<any | undefined>;
}
