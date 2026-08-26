import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { ThsService } from './ths.service';
import { UsersService } from '@/users/users.service';
export declare class SpecialStockService {
    private readonly specialStockRp;
    private readonly thsService;
    private readonly usersService;
    constructor(specialStockRp: Repository<specialStock>, thsService: ThsService, usersService: UsersService);
    private readonly logger;
    crawlBinddingData(isRemoveIncompatible: number, account: any): Promise<any>;
    crawlSpecialStockData(account: any): Promise<any>;
    dealIncompatibleExpectStocks(dailyLimitYesterdayBidding: any, account: any): Promise<void>;
    getTodayData(todayDateStr: string): Promise<specialStock>;
    findAll(): Promise<specialStock[]>;
    findByLimit(len?: number): Promise<specialStock[]>;
    getLastTradingDayByDB(todayDateStr: any): Promise<string>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
