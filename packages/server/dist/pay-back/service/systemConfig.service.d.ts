import { Repository } from 'typeorm';
import { systemConfig } from '../entities/systemConfig.entity';
export declare class SystemConfigService {
    private readonly sysTemconfigServiceRp;
    constructor(sysTemconfigServiceRp: Repository<systemConfig>);
    private readonly logger;
    findAll(): Promise<systemConfig[]>;
    updateSystemConfig(systemConfigDto: any): Promise<any>;
    findLatestOne(): Promise<systemConfig>;
}
