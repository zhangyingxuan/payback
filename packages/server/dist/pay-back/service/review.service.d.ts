import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
export declare class ReviewService {
    private readonly marketDataRp;
    constructor(marketDataRp: Repository<marketData>);
    private readonly logger;
    updateTodayReviewData(): Promise<CreateMarketDataDto | {
        code: string;
        msg: string;
    }>;
    findAll(): Promise<marketData[]>;
    findByLimit(len?: number): Promise<marketData[]>;
    findPlateByLimit(len?: number): Promise<marketData[]>;
}
