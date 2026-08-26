import { Repository } from 'typeorm';
import { latestConceptPlate } from '../entities/latestConceptPlate.entity';
import { UsersService } from '@/users/users.service';
export declare class LatestConceptPlateService {
    private readonly latestConceptPlateRp;
    private readonly usersService;
    constructor(latestConceptPlateRp: Repository<latestConceptPlate>, usersService: UsersService);
    private readonly logger;
    crawlLatestConceptPlateData(account?: string): Promise<any>;
    findAll(): Promise<latestConceptPlate[]>;
    findByLimit(len?: number): Promise<latestConceptPlate[]>;
    findWithinNDays(n?: number): Promise<latestConceptPlate[]>;
    findLatestOne(): Promise<latestConceptPlate>;
}
