import { Repository } from 'typeorm';
import { latestConceptPlate } from '../entities/latestConceptPlate.entity';
export declare class LatestConceptPlateService {
    private readonly latestConceptPlateRp;
    constructor(latestConceptPlateRp: Repository<latestConceptPlate>);
    private readonly logger;
    autoCrawlLatestConceptPlateDataAm(): Promise<any>;
    autoCrawlLatestConceptPlateDataPm(): Promise<any>;
    autoCrawlLatestConceptPlateDataEvening(): Promise<any>;
    crawlLatestConceptPlateData(): Promise<any>;
    findAll(): Promise<latestConceptPlate[]>;
    findByLimit(len?: number): Promise<latestConceptPlate[]>;
    findWithinNDays(n?: number): Promise<latestConceptPlate[]>;
    findLatestOne(): Promise<latestConceptPlate>;
}
