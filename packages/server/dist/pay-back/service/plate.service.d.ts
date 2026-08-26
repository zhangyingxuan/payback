import { Repository } from 'typeorm';
import { plateData } from '../entities/plateData.entity';
import { CreatePlateDataDto } from '../dto/create-plate-data.dto';
import { UsersService } from '@/users/users.service';
export declare class PlateService {
    private readonly plateDataRp;
    private readonly usersService;
    constructor(plateDataRp: Repository<plateData>, usersService: UsersService);
    private readonly logger;
    crawlPlateData(account?: string): Promise<CreatePlateDataDto>;
    findAll(): Promise<plateData[]>;
    findByLimit(len?: number): Promise<plateData[]>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
