import { SchedulerRegistry } from '@nestjs/schedule';
export declare class SchedulerTaskService {
    private readonly schedulerRegistry;
    private readonly logger;
    private lastUnknownDate?;
    constructor(schedulerRegistry: SchedulerRegistry);
    executeTask(name: string, cronExpression: Date | string, callback: () => void, needDel?: boolean, tradingDaysOnly?: boolean): Promise<void>;
    deleteCron(name: string): void;
    doesExist(type: 'cron' | 'timeout' | 'interval', name: string): boolean;
}
