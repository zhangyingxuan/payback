import { UsersService } from '../../users/users.service';
export declare class ThsService {
    private readonly usersService;
    constructor(usersService: UsersService);
    private readonly logger;
    modifyThsSelfStocks(evenBoardData: any): Promise<{
        code: number;
        data: any;
    }>;
    updateThsSelfStock(code: any, type: any): Promise<{
        code: number;
        data: any;
    } | {
        code: number;
        data?: undefined;
    }>;
    batchUpdateThsSelfStock(stocks: any[], type: any): Promise<{
        code: number;
    }>;
    updateThsSelfPlate(code: any, type: any): Promise<{
        code: number;
        data: any;
    } | {
        code: number;
        data?: undefined;
    }>;
}
