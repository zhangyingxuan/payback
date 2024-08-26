import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { ThsService } from './ths.service';
export declare class SpecialStockService {
    private readonly specialStockRp;
    private readonly thsService;
    constructor(specialStockRp: Repository<specialStock>, thsService: ThsService);
    private readonly logger;
    crawlBinddingData(isRemoveIncompatible: number, account: any): Promise<any>;
    crawlSpecialStockData(): Promise<any>;
    dealIncompatibleExpectStocks(dailyLimitYesterdayBidding: any, account: any): Promise<void>;
    getTodayData(todayDateStr: string): Promise<specialStock>;
    findAll(): Promise<specialStock[]>;
    findByLimit(len?: number): Promise<specialStock[]>;
    getLastTradingDayByDB(todayDateStr: any): Promise<string>;
    delteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
