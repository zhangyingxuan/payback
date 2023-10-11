import { SpecialStockDto } from '../dto/special-stock.dto';
import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { ThsService } from './ths.service';
export declare class SpecialStockService {
    private readonly specialStockRp;
    private readonly thsService;
    constructor(specialStockRp: Repository<specialStock>, thsService: ThsService);
    private readonly logger;
    autoCrawlBinddingData(): Promise<void>;
    autoCrawlBinddingDataLateSession(): Promise<void>;
    crawlBinddingData(isRemoveIncompatible?: boolean): Promise<SpecialStockDto>;
    dealIncompatibleExpectStocks(isRemoveIncompatible: any, dailyLimitYesterdayBidding: any): Promise<void>;
    getTodayData(todayDateStr: string): Promise<specialStock>;
    findAll(): Promise<specialStock[]>;
    findByLimit(len?: number): Promise<specialStock[]>;
    getLastTradingDayByDB(todayDateStr: any): Promise<string>;
}
