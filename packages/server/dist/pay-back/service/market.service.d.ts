import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { UsersService } from '@/users/users.service';
export declare class MarketService {
    private readonly marketDataRp;
    private readonly usersService;
    constructor(marketDataRp: Repository<marketData>, usersService: UsersService);
    private readonly logger;
    crawlMarketData(account?: string): Promise<CreateMarketDataDto>;
    findAll(): Promise<marketData[]>;
    findByLimit(len?: number): Promise<marketData[]>;
    findPlateByLimit(len?: number): Promise<marketData[]>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
