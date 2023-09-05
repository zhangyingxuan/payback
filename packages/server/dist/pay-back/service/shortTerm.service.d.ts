import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { ThsService } from './ths.service';
export declare class ShorTermService {
    private readonly thsService;
    private readonly shortTermDataRp;
    constructor(thsService: ThsService, shortTermDataRp: Repository<shortTermData>);
    private readonly logger;
    autoCrawlShortTermDataLateSession(): Promise<void>;
    autoCrawlShortTermDataMidday(): Promise<void>;
    autoRemoveLessThanExpect(): Promise<void>;
    autoCrawlBinddingData(): Promise<void>;
    autoCrawlBinddingDataLateSession(): Promise<void>;
    crawlBinddingData(): Promise<CreatePayBackDto>;
    crawlShortTermData(): Promise<CreatePayBackDto>;
    crawlShortTermDataByDate(todayDateStr: any): Promise<CreatePayBackDto | {
        code: string;
        msg: string;
    }>;
    getTodayData(todayDateStr: string): Promise<shortTermData>;
    findAll(): Promise<shortTermData[]>;
    findByLimit(len?: number): Promise<shortTermData[]>;
    findEvenBoardByLimit(len?: number): Promise<shortTermData[]>;
    getLastTradingDayByDB(todayDateStr: any): Promise<string>;
}
