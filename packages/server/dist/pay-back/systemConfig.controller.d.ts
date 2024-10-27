import { SystemConfigService } from './service/systemConfig.service';
import { SchedulerTaskService } from '@/scheduler-task/scheduler-task.service';
import { ClientProxy } from '@nestjs/microservices';
declare class SystemConfigDto {
    isAutoAddSelf: number;
    isAutoAddSelfEvenBoard: number;
    isAutoAddSelfFirstBoard: number;
    isBinddingDelEventBoard: number;
    isBinddingDelFirstBoard: number;
    isAutoPushNews: number;
}
export declare class SystemConfigController {
    private readonly systemConfigService;
    private readonly schedulerTaskService;
    private pushServer;
    constructor(systemConfigService: SystemConfigService, schedulerTaskService: SchedulerTaskService, pushServer: ClientProxy);
    private readonly logger;
    fetchSystemConfig(): Promise<{
        code: number;
        data: import("./entities/systemConfig.entity").systemConfig;
    }>;
    updateSystemConfig(body: SystemConfigDto): Promise<{
        code: number;
        data: any;
    }>;
    toggleNewsPushEnable(body: SystemConfigDto): Promise<{
        code: number;
        message: any;
        data?: undefined;
    } | {
        code: number;
        data: any;
        message?: undefined;
    }>;
}
export {};
