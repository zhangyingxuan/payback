import { SpecialStockDto } from '../dto/special-stock.dto';
import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
export declare class SpecialStockService {
    private readonly specialStockRp;
    constructor(specialStockRp: Repository<specialStock>);
    private readonly logger;
    autoCrawlBinddingData(): Promise<void>;
    autoCrawlBinddingDataLateSession(): Promise<void>;
    crawlBinddingData(): Promise<SpecialStockDto>;
    getTodayData(todayDateStr: string): Promise<specialStock>;
    findAll(): Promise<specialStock[]>;
    findByLimit(len?: number): Promise<specialStock[]>;
    getLastTradingDayByDB(todayDateStr: any): Promise<string>;
}
