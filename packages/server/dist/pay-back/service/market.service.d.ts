import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
export declare class MarketService {
    private readonly marketDataRp;
    constructor(marketDataRp: Repository<marketData>);
    private readonly logger;
    行业板块: any;
    autoCrawlMarketDataLateSession(): Promise<void>;
    autoCrawlMarketDataMidday(): Promise<void>;
    crawlMarketData(): Promise<CreateMarketDataDto>;
    findAll(): Promise<marketData[]>;
    findByLimit(len?: number): Promise<marketData[]>;
    findPlateByLimit(len?: number): Promise<marketData[]>;
}
