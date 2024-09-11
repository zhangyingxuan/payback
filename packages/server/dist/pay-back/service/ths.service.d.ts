import { UsersService } from '../../users/users.service';
import { SystemConfigService } from './systemConfig.service';
import { QyWechatNotice } from './qyWechatNotice.service';
export declare class ThsService {
    private readonly usersService;
    private readonly systemConfigService;
    private readonly qyWechatNotice;
    constructor(usersService: UsersService, systemConfigService: SystemConfigService, qyWechatNotice: QyWechatNotice);
    private readonly logger;
    private latestTime;
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
    fetchNewsTask(): Promise<void>;
}
