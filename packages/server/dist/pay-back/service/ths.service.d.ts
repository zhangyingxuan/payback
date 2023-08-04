import { UsersService } from '../../users/users.service';
export declare class ThsService {
    private readonly usersService;
    constructor(usersService: UsersService);
    private readonly logger;
    modifyThsSelfStocks(evenBoardData: any): Promise<{
        code: number;
        data: any;
    }>;
}
