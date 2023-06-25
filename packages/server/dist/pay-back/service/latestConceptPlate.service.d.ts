import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
export declare class MarketService {
    private readonly marketDataRp;
    constructor(marketDataRp: Repository<marketData>);
    private readonly logger;
    crawlMarketData(): Promise<any>;
    findAll(): Promise<marketData[]>;
}
