import { UsersService } from '../../users/users.service';
export declare class ThsService {
    private readonly usersService;
    constructor(usersService: UsersService);
    private readonly logger;
    nextRegister(args: Array<Function>): void;
    modifyThsSelfStocks(evenBoardData: any): Promise<{
        code: number;
        data: any;
    }>;
}
