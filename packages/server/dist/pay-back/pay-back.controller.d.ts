import { ShorTermService } from './service/shortTerm.service';
import { SpecialStockService } from './service/specialStock.service';
import { MarketService } from './service/market.service';
import { PlateService } from './service/plate.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { SchedulerTaskService } from '@/scheduler-task/scheduler-task.service';
import { UsersService } from '../users/users.service';
import { QyWechatNotice } from './service/qyWechatNotice.service';
import { SystemConfigService } from './service/systemConfig.service';
declare class CrawlTodayDataDto {
    fetchTodayDataType: number;
    isRemoveIncompatible: number;
}
export declare class PayBackController {
    private readonly shorTermService;
    private readonly specialStockService;
    private readonly fundsService;
    private readonly hotListService;
    private readonly reviewService;
    private readonly thsService;
    private readonly apiTestService;
    private readonly latestConceptPlateService;
    private readonly usersService;
    private readonly marketService;
    private readonly plateService;
    private readonly schedulerTaskService;
    private readonly qyWechatNotice;
    private readonly systemConfigService;
    constructor(shorTermService: ShorTermService, specialStockService: SpecialStockService, fundsService: FundsService, hotListService: HotListService, reviewService: ReviewService, thsService: ThsService, apiTestService: ApiTestService, latestConceptPlateService: LatestConceptPlateService, usersService: UsersService, marketService: MarketService, plateService: PlateService, schedulerTaskService: SchedulerTaskService, qyWechatNotice: QyWechatNotice, systemConfigService: SystemConfigService);
    private readonly logger;
    testApi(query: any): Promise<void>;
    autoCrawlTodayDataAM(): Promise<void>;
    autoCrawlTodayDataPM(): Promise<void>;
    crawlTodayData(body: CrawlTodayDataDto, req: any): Promise<{
        code: number;
        data: any;
    }>;
    crawlBinddingData(body: CrawlTodayDataDto, req: any): Promise<{
        code: number;
        data: any;
    }>;
    crawlSpecialStockData(): Promise<{
        code: number;
        data: any;
    }>;
    deleteData(body: any): Promise<{
        code: number;
        message: string;
    }>;
    crawlHotListData(): Promise<{
        code: number;
        data: import("./dto/create-hot-list.dto").CreateHotListDto;
    }>;
    crawlShortTermByDate(query: any): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto>;
    crawlPlateData(): Promise<{
        code: number;
        data: import("./dto/create-Plate-data.dto").CreatePlateDataDto;
    }>;
    findByLimit(query: any): Promise<{
        code: number;
        data: {
            shortTermData: import("./entities/shortTermData.entity").shortTermData[];
            marketData: import("./entities/marketData.entity").marketData[];
            fundsData: import("./entities/fundsData.entity").fundsData[];
        };
    }>;
    fetchEvenBoardData(query: any): Promise<{
        code: number;
        data: any[];
    }>;
    fetchHostListData(query: any): Promise<{
        code: number;
        data: import("./entities/hotList.entity").hotList[];
    }>;
    fetchReveiwDataByDate(query: any): Promise<{
        code: number;
        data: import("./entities/review.entity").reviewData;
    }>;
    findConceptPlateWithinNDays(query: any): Promise<{
        code: number;
        data: import("./entities/latestConceptPlate.entity").latestConceptPlate[];
    }>;
    findConceptPlateByLimit(query: any): Promise<{
        code: number;
        data: import("./entities/latestConceptPlate.entity").latestConceptPlate[];
    }>;
    findPlateByLimit(query: any): Promise<{
        code: number;
        data: import("./entities/marketData.entity").marketData[];
    }>;
    fetchPlateOrderByDailyLimit(query: any): Promise<{
        code: number;
        data: import("./entities/plateData.entity").plateData[];
    }>;
    saveUserInfo(body: any, req: any): Promise<{
        code: number;
    }>;
    initSchedulerTask(): Promise<void>;
}
export {};
