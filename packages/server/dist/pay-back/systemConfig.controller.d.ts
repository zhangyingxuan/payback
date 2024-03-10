import { SystemConfigService } from './service/systemConfig.service';
declare class SystemConfigDto {
    isAutoAddSelf: number;
    isAutoAddSelfEvenBoard: number;
    isAutoAddSelfFirstBoard: number;
}
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    private readonly logger;
    fetchSystemConfig(): Promise<{
        code: number;
        data: any;
    }>;
    updateSystemConfig(body: SystemConfigDto): Promise<{
        code: number;
        data: any;
    }>;
}
export {};
