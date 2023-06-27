import { Repository } from 'typeorm';
import { latestConceptPlate } from '../entities/latestConceptPlate.entity';
export declare class LatestConceptPlateService {
    private readonly latestConceptPlateRp;
    constructor(latestConceptPlateRp: Repository<latestConceptPlate>);
    private readonly logger;
    crawlLatestConceptPlateData(): Promise<any>;
    findAll(): Promise<latestConceptPlate[]>;
    findLatestOne(): Promise<latestConceptPlate>;
}
