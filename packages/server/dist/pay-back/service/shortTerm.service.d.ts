import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { ThsService } from './ths.service';
import { SpecialStockService } from './specialStock.service';
export declare class ShorTermService {
    private readonly thsService;
    private readonly specialStockService;
    private readonly shortTermDataRp;
    constructor(thsService: ThsService, specialStockService: SpecialStockService, shortTermDataRp: Repository<shortTermData>);
    private readonly logger;
    autoCrawlShortTermDataLateSession(): Promise<void>;
    autoCrawlShortTermDataMidday(): Promise<void>;
    autoCrawlShortTermDataMorning(): Promise<void>;
    crawlShortTermData(): Promise<CreatePayBackDto>;
    crawlShortTermDataByDate(todayDateStr: any): Promise<CreatePayBackDto>;
    getTodayData(todayDateStr: string): any;
    findAll(): Promise<any>;
    findByLimit(len?: number): Promise<any>;
    findEvenBoardByLimit(len?: number): Promise<any[]>;
}
