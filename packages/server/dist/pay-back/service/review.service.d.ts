import { Repository } from 'typeorm';
import { reviewData } from '../entities/review.entity';
export declare class ReviewService {
    private readonly reviewDataRp;
    constructor(reviewDataRp: Repository<reviewData>);
    private readonly logger;
    findAll(): Promise<reviewData[]>;
    findByLimit(len?: number): Promise<reviewData[]>;
    findByDate(date: string): Promise<reviewData>;
}
