import { Repository } from 'typeorm';
import { fundsData } from '../entities/fundsData.entity';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { UsersService } from '@/users/users.service';
export declare class FundsService {
    private readonly fundsDataRp;
    private readonly usersService;
    constructor(fundsDataRp: Repository<fundsData>, usersService: UsersService);
    private readonly logger;
    crawlfundsData(account?: string): Promise<CreateFundsDataDto>;
    findAll(): Promise<fundsData[]>;
    findByLimit(len?: number): Promise<fundsData[]>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
