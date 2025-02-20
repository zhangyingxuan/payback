import { UsersService } from '../../users/users.service';
import { SystemConfigService } from './systemConfig.service';
export declare class ThsService {
    private readonly usersService;
    private readonly systemConfigService;
    constructor(usersService: UsersService, systemConfigService: SystemConfigService);
    private readonly logger;
    autoModifyThsSelfStocks(evenBoardData: any, account: any): Promise<{
        code: number;
    }>;
    batchUpdateThsSelfStock(stocks: any[], type: any, account: any): Promise<{
        code: number;
    }>;
    updateThsSelfStock(code: any, type: any, account: any): Promise<{
        code: number;
        data: string;
    }>;
    updateThsSelfPlate(code: any, type: any, account: any): Promise<{
        code: number;
        data: string;
    }>;
    updateThsSelfPlateByNameCn(plateNameCn: any, type: any, account: any): Promise<{
        code: number;
        data: string;
    }>;
}
