import { Repository } from 'typeorm';
import { marketData } from './entities/marketData.entity';
import { CreateMarketDataDto } from './dto/create-market-data.dto';
export declare class MarketService {
    private readonly marketDataRp;
    constructor(marketDataRp: Repository<marketData>);
    private readonly logger;
    crawlMarketData(): Promise<CreateMarketDataDto | {
        code: string;
        msg: string;
    }>;
    findAll(): Promise<marketData[]>;
    findByLimit(len?: number): Promise<marketData[]>;
}
