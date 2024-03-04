import { UsersService } from '../../users/users.service';
import { SystemConfigService } from './systemConfig.service';
export declare class ThsService {
    private readonly usersService;
    private readonly systemConfigService;
    constructor(usersService: UsersService, systemConfigService: SystemConfigService);
    private readonly logger;
    autoModifyThsSelfStocks(evenBoardData: any): Promise<{
        code: number;
        data: any;
    }>;
    modifyThsSelfStocks(evenBoardData: any, sysTemconfig: any): Promise<{
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
