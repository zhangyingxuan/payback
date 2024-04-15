import { Repository } from 'typeorm';
import { plateData } from '../entities/plateData.entity';
import { CreatePlateDataDto } from '../dto/create-plate-data.dto';
export declare class PlateService {
    private readonly plateDataRp;
    constructor(plateDataRp: Repository<plateData>);
    private readonly logger;
    autoCrawlPlateDataLateSession(): Promise<void>;
    autoCrawlPlateDataMidday(): Promise<void>;
    crawlPlateData(): Promise<CreatePlateDataDto>;
    findAll(): Promise<plateData[]>;
    findByLimit(len?: number): Promise<plateData[]>;
    delteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
