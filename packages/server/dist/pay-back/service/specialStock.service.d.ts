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
    crawlBinddingData(isRemoveIncompatible: number, account: any): Promise<SpecialStockDto>;
    dealIncompatibleExpectStocks(dailyLimitYesterdayBidding: any, account: any): Promise<void>;
    getTodayData(todayDateStr: string): any;
    findAll(): Promise<any>;
    findByLimit(len?: number): Promise<any>;
    getLastTradingDayByDB(todayDateStr: any): Promise<any>;
}
