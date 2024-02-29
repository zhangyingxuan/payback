import { SystemConfigService } from './service/systemConfig.service';
declare class SystemConfigDto {
    isAutoAddSelfStock: number;
}
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    private readonly logger;
    fetchSystemConfig(): Promise<{
        code: number;
        data: import("./entities/systemConfig.entity").systemConfig;
    }>;
    updateSystemConfig(body: SystemConfigDto): Promise<{
        code: number;
        data: any;
    }>;
}
export {};
