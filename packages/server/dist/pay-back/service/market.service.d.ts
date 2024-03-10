import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
export declare class MarketService {
    private readonly marketDataRp;
    constructor(marketDataRp: Repository<marketData>);
    private readonly logger;
    autoCrawlMarketDataLateSession(): Promise<void>;
    autoCrawlMarketDataMidday(): Promise<void>;
    crawlMarketData(): Promise<CreateMarketDataDto>;
    findAll(): Promise<any>;
    findByLimit(len?: number): Promise<any>;
    findPlateByLimit(len?: number): Promise<any>;
}
