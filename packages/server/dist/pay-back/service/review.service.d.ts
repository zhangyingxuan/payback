import { Repository } from 'typeorm';
import { reviewData } from '../entities/review.entity';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';
export declare class ReviewService {
    private readonly reviewDataRp;
    constructor(reviewDataRp: Repository<reviewData>);
    private readonly logger;
    updateTodayReviewData(): Promise<CreateMarketDataDto | {
        code: string;
        msg: string;
    }>;
    findAll(): Promise<reviewData[]>;
    findByLimit(len?: number): Promise<reviewData[]>;
    findByDate(date: string): Promise<reviewData>;
}
