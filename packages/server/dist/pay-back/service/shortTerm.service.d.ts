import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { ThsService } from './ths.service';
import { SpecialStockService } from './specialStock.service';
import { UsersService } from '@/users/users.service';
export declare class ShorTermService {
    private readonly thsService;
    private readonly specialStockService;
    private readonly usersService;
    private readonly shortTermDataRp;
    constructor(thsService: ThsService, specialStockService: SpecialStockService, usersService: UsersService, shortTermDataRp: Repository<shortTermData>);
    private readonly logger;
    crawlShortTermData(account?: string): Promise<CreatePayBackDto>;
    crawlShortTermDataByDate(todayDateStr: any, account?: string): Promise<CreatePayBackDto>;
    getTodayData(todayDateStr: string): Promise<shortTermData>;
    getLastTradingDayData(todayDateStr: string): Promise<shortTermData>;
    findAll(): Promise<shortTermData[]>;
    findByLimit(len?: number): Promise<shortTermData[]>;
    findEvenBoardByLimit(len?: number): Promise<any[]>;
    deleteByCreateTime(date: any): Promise<import("typeorm").DeleteResult>;
}
